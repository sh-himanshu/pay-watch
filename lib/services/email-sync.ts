import { google } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isBillCandidate } from "./email-filter";
import { parseWithRules } from "./parser-rules";
import { parseWithLLM } from "./parser-llm";
import type { ParseResult } from "./parser-rules";
import type { LLMParseResult } from "./parser-llm";
import {
	detectPriceIncrease,
	detectUnexpectedCharge,
	detectNewBiller,
	computeRollingAverage,
} from "./fee-detection";
import { sendPushNotification } from "./push";
import type { EmailAccount } from "@/lib/types";

type SyncResult = {
	billsCreated: number;
	alertsCreated: number;
	errors: string[];
};

export async function syncEmailAccount(
	supabase: SupabaseClient,
	account: EmailAccount,
): Promise<SyncResult> {
	const result: SyncResult = { billsCreated: 0, alertsCreated: 0, errors: [] };

	// Refresh token if expired
	account = await refreshTokenIfNeeded(supabase, account);
	if (account.sync_status === "error") {
		return { billsCreated: 0, alertsCreated: 0, errors: ["Token refresh failed"] };
	}

	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: account.access_token,
		refresh_token: account.refresh_token,
	});

	const gmail = google.gmail({ version: "v1", auth: oauth2Client });

	// Build query for emails since last sync (or last 30 days)
	const sinceDate = account.last_synced_at
		? new Date(account.last_synced_at)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const afterTimestamp = Math.floor(sinceDate.getTime() / 1000);

	let messages: { id: string }[] = [];
	try {
		const listResponse = await withRetry(() =>
			gmail.users.messages.list({
				userId: "me",
				q: `after:${afterTimestamp}`,
				maxResults: 100,
			}),
		);
		messages = (listResponse.data.messages ?? []) as { id: string }[];
	} catch (error) {
		result.errors.push(`Failed to list messages: ${error}`);
		return result;
	}

	let llmCallCount = 0;

	for (const msg of messages) {
		try {
			const detail = await gmail.users.messages.get({
				userId: "me",
				id: msg.id,
				format: "full",
			});

			const headers = detail.data.payload?.headers ?? [];
			const subject =
				headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
			const from =
				headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
			const date =
				headers.find((h) => h.name?.toLowerCase() === "date")?.value ?? "";

			// Extract sender email from "Name <email>" format
			const senderMatch = from.match(/<(.+?)>/) ?? [null, from];
			const senderEmail = senderMatch[1] ?? from;

			if (!isBillCandidate(subject, senderEmail)) continue;

			// Extract plain text body
			const body = extractTextBody(detail.data.payload) ?? "";

			// Try rule-based parser first
			let parseResult: ParseResult | LLMParseResult | null = parseWithRules(senderEmail, subject, body);

			// Fall back to LLM if rules didn't match
			if (!parseResult && llmCallCount < 50) {
				llmCallCount++;
				parseResult = await parseWithLLM(body);
			}

			if (!parseResult) continue;

			// Validate: amount must be positive
			if (parseResult.amount <= 0) continue;

			// Upsert biller
			const { data: biller, error: billerError } = await supabase
				.from("billers")
				.upsert(
					{
						user_id: account.user_id,
						name: parseResult.billerName,
						category: parseResult.billerCategory,
						first_seen_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,name" },
				)
				.select()
				.single();

			if (billerError || !biller) {
				result.errors.push(
					`Failed to upsert biller ${parseResult.billerName}: ${billerError?.message}`,
				);
				continue;
			}

			// Parse due date to ISO format
			const dueDate = parseDueDate(parseResult.dueDate);

			// Insert bill (unique on user_id + biller_id + source_email_id)
			const { data: bill, error: billError } = await supabase
				.from("bills")
				.upsert(
					{
						user_id: account.user_id,
						biller_id: biller.id,
						email_account_id: account.id,
						amount: parseResult.amount,
						due_date: dueDate,
						status: computeBillStatus(dueDate),
						source_email_id: msg.id,
						source_email_subject: subject,
						source_email_date: new Date(date).toISOString(),
						parsed_by: parseResult.parsedBy,
						confidence: parseResult.confidence,
					},
					{ onConflict: "user_id,biller_id,source_email_id" },
				)
				.select()
				.single();

			if (billError) {
				result.errors.push(`Failed to insert bill: ${billError.message}`);
				continue;
			}

			result.billsCreated++;

			// Run fee detection
			const alerts = await runFeeDetection(
				supabase,
				account.user_id,
				biller,
				bill,
				body,
				subject,
			);
			result.alertsCreated += alerts;

			// Update biller typical_amount with rolling average
			const { data: recentBills } = await supabase
				.from("bills")
				.select("amount")
				.eq("biller_id", biller.id)
				.order("created_at", { ascending: false })
				.limit(6);

			if (recentBills && recentBills.length > 0) {
				const avg = computeRollingAverage(
					recentBills.map((b) => Number(b.amount)),
				);
				await supabase
					.from("billers")
					.update({ typical_amount: avg })
					.eq("id", biller.id);
			}
		} catch (error) {
			result.errors.push(`Error processing message ${msg.id}: ${error}`);
		}
	}

	// Update last_synced_at
	await supabase
		.from("email_accounts")
		.update({ last_synced_at: new Date().toISOString() })
		.eq("id", account.id);

	return result;
}

async function runFeeDetection(
	supabase: SupabaseClient,
	userId: string,
	biller: { id: string; name: string; typical_amount: number | null; first_seen_at: string },
	bill: { id: string; amount: number },
	emailBody: string,
	emailSubject: string,
): Promise<number> {
	let alertCount = 0;

	// Check if this is a new biller (first_seen_at within last minute)
	const isNew =
		new Date(biller.first_seen_at).getTime() > Date.now() - 60 * 1000;

	if (isNew) {
		const alert = detectNewBiller(
			biller.name,
			Number(bill.amount),
			emailSubject,
		);
		await insertAlert(supabase, userId, bill.id, biller.id, alert);
		alertCount++;
	}

	// Price increase detection
	const priceAlert = detectPriceIncrease(
		Number(bill.amount),
		biller.typical_amount,
	);
	if (priceAlert) {
		priceAlert.title = `${biller.name} ${priceAlert.title.toLowerCase()}`;
		await insertAlert(supabase, userId, bill.id, biller.id, priceAlert);
		alertCount++;
	}

	// Unexpected charge detection
	const { data: history } = await supabase
		.from("bills")
		.select("amount")
		.eq("biller_id", biller.id)
		.neq("id", bill.id)
		.order("created_at", { ascending: false })
		.limit(10);

	if (history) {
		const unexpectedAlert = detectUnexpectedCharge(
			Number(bill.amount),
			history.map((b) => Number(b.amount)),
			emailBody,
		);
		if (unexpectedAlert) {
			await insertAlert(supabase, userId, bill.id, biller.id, unexpectedAlert);
			alertCount++;
		}
	}

	return alertCount;
}

async function insertAlert(
	supabase: SupabaseClient,
	userId: string,
	billId: string,
	billerId: string,
	alert: { type: string; severity: string; title: string; description: string; metadata: Record<string, unknown> },
): Promise<void> {
	await supabase.from("alerts").insert({
		user_id: userId,
		bill_id: billId,
		biller_id: billerId,
		type: alert.type,
		severity: alert.severity,
		title: alert.title,
		description: alert.description,
		metadata: alert.metadata,
	});

	// Send push for urgent alerts
	if (alert.severity === "urgent") {
		const { data: prefs } = await supabase
			.from("notification_preferences")
			.select("push_enabled, push_subscription, quiet_hours_start, quiet_hours_end")
			.eq("user_id", userId)
			.single();

		if (prefs?.push_enabled && prefs.push_subscription) {
			if (!isQuietHours(prefs.quiet_hours_start, prefs.quiet_hours_end)) {
				await sendPushNotification(
					prefs.push_subscription as never,
					{
						title: alert.title,
						body: alert.description,
						url: "/dashboard/alerts",
					},
				);
			}
		}
	}
}

function isQuietHours(start: string | null, end: string | null): boolean {
	if (!start || !end) return false;
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const currentMinutes = hours * 60 + minutes;

	const [startH, startM] = start.split(":").map(Number);
	const [endH, endM] = end.split(":").map(Number);
	const startMinutes = startH * 60 + startM;
	const endMinutes = endH * 60 + endM;

	if (startMinutes <= endMinutes) {
		return currentMinutes >= startMinutes && currentMinutes < endMinutes;
	}
	// Overnight quiet hours (e.g., 22:00 - 08:00)
	return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function extractTextBody(
	payload: { mimeType?: string | null; body?: { data?: string | null } | null; parts?: unknown[] | null } | undefined,
): string | null {
	if (!payload) return null;

	if (payload.mimeType === "text/plain" && payload.body?.data) {
		return Buffer.from(payload.body.data, "base64url").toString("utf-8");
	}

	if (payload.parts) {
		for (const part of payload.parts as typeof payload[]) {
			const text = extractTextBody(part);
			if (text) return text;
		}
	}

	return null;
}

function parseDueDate(dateStr: string | null): string {
	if (!dateStr) {
		// Default to 30 days from now if no due date found
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().split("T")[0];
	}

	const parsed = new Date(dateStr);
	if (Number.isNaN(parsed.getTime())) {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().split("T")[0];
	}

	return parsed.toISOString().split("T")[0];
}

function computeBillStatus(dueDate: string): "upcoming" | "due_soon" | "overdue" {
	const due = new Date(dueDate);
	const now = new Date();
	const diffDays = Math.ceil(
		(due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays < 0) return "overdue";
	if (diffDays <= 3) return "due_soon";
	return "upcoming";
}

async function refreshTokenIfNeeded(
	supabase: SupabaseClient,
	account: EmailAccount,
): Promise<EmailAccount> {
	const expiresAt = new Date(account.token_expires_at);
	if (expiresAt > new Date()) return account;

	// Token expired — attempt refresh
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
	);
	oauth2Client.setCredentials({ refresh_token: account.refresh_token });

	try {
		const { credentials } = await oauth2Client.refreshAccessToken();

		if (credentials.access_token) {
			await supabase
				.from("email_accounts")
				.update({
					access_token: credentials.access_token,
					token_expires_at: credentials.expiry_date
						? new Date(credentials.expiry_date).toISOString()
						: new Date(Date.now() + 3600 * 1000).toISOString(),
					sync_status: "active",
				})
				.eq("id", account.id);

			return {
				...account,
				access_token: credentials.access_token,
				token_expires_at: credentials.expiry_date
					? new Date(credentials.expiry_date).toISOString()
					: new Date(Date.now() + 3600 * 1000).toISOString(),
			};
		}
	} catch {
		// Refresh failed — mark account as error
		await supabase
			.from("email_accounts")
			.update({ sync_status: "error" })
			.eq("id", account.id);
	}

	return { ...account, sync_status: "error" };
}

async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
): Promise<T> {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error: unknown) {
			const isRateLimit =
				error instanceof Error &&
				(error.message.includes("429") || error.message.includes("rate limit"));

			if (!isRateLimit || attempt === maxRetries) throw error;

			// Exponential backoff with jitter
			const delay = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 30000);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	throw new Error("Max retries exceeded");
}
