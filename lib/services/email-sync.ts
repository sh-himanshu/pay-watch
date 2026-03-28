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
		const listResponse = await gmail.users.messages.list({
			userId: "me",
			q: `after:${afterTimestamp}`,
			maxResults: 100,
		});
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
