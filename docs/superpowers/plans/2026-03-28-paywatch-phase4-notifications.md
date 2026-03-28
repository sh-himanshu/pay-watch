# PayWatch Phase 4: Notifications & Hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-channel notifications (in-app real-time, push via web-push, email digest via Resend) and harden error handling across the app.

**Architecture:** In-app uses Supabase Realtime subscriptions on the `alerts` table. Push uses the `web-push` library with VAPID keys and a service worker. Email digest is a Vercel Cron job rendering React Email components and sending via Resend.

**Tech Stack:** Supabase Realtime, web-push (VAPID), Resend, Next.js service worker, Vercel Cron

**Spec references:** `docs/superpowers/specs/paywatch/04-notifications.md`, `docs/superpowers/specs/paywatch/07-error-security-env.md`

**Prerequisites:** Phase 1 (auth + DB), Phase 2 (API routes + cron), and Phase 3 (UI pages) all complete.

---

### Task 1: In-App Real-Time Alerts

**Files:**
- Create: `components/dashboard/realtime-alerts.tsx`
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Create real-time alert listener**

Create `components/dashboard/realtime-alerts.tsx`:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export function RealtimeAlerts({ userId }: { userId: string }) {
	const [newCount, setNewCount] = useState(0);
	const router = useRouter();

	useEffect(() => {
		const supabase = createClient();

		const channel = supabase
			.channel("alerts-realtime")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "alerts",
					filter: `user_id=eq.${userId}`,
				},
				() => {
					setNewCount((c) => c + 1);
					router.refresh();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, router]);

	if (newCount === 0) return null;

	return (
		<button
			type="button"
			onClick={() => {
				setNewCount(0);
				router.push("/dashboard/alerts");
			}}
			className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-accent/90 z-50"
		>
			<Bell size={16} />
			{newCount} new alert{newCount > 1 ? "s" : ""}
		</button>
	);
}
```

- [ ] **Step 2: Enable Supabase Realtime on alerts table**

Run in Supabase SQL Editor:

```sql
alter publication supabase_realtime add table public.alerts;
```

- [ ] **Step 3: Add realtime listener to dashboard layout**

Modify `app/dashboard/layout.tsx` — add `RealtimeAlerts` below the closing `</main>` tag:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RealtimeAlerts } from "@/components/dashboard/realtime-alerts";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<Sidebar />
			<main className="flex-1 overflow-auto">{children}</main>
			<RealtimeAlerts userId={user.id} />
		</div>
	);
}
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/realtime-alerts.tsx app/dashboard/layout.tsx
git commit -m "feat: add in-app real-time alert notifications via Supabase Realtime"
```

---

### Task 2: Push Notifications — Service Worker & Subscription

**Files:**
- Create: `public/sw.js`
- Create: `lib/services/push.ts`
- Create: `app/api/push/subscribe/route.ts`
- Create: `components/settings/push-toggle.tsx`

- [ ] **Step 1: Create service worker**

Create `public/sw.js`:

```javascript
self.addEventListener("push", (event) => {
	const data = event.data ? event.data.json() : {};
	const title = data.title || "PayWatch";
	const options = {
		body: data.body || "You have a new notification",
		icon: "/favicon.ico",
		badge: "/favicon.ico",
		data: { url: data.url || "/dashboard" },
	};
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url || "/dashboard";
	event.waitUntil(clients.openWindow(url));
});
```

- [ ] **Step 2: Create push helper**

Create `lib/services/push.ts`:

```typescript
import webpush from "web-push";

webpush.setVapidDetails(
	"mailto:noreply@paywatch.app",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushNotification(
	subscription: webpush.PushSubscription,
	payload: { title: string; body: string; url?: string },
): Promise<boolean> {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
		return true;
	} catch {
		return false;
	}
}
```

- [ ] **Step 3: Create push subscribe API route**

Create `app/api/push/subscribe/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const subscription = await request.json();

	const { error } = await supabase
		.from("notification_preferences")
		.update({
			push_subscription: subscription,
			push_enabled: true,
		})
		.eq("user_id", user.id);

	if (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	return Response.json({ success: true });
}
```

- [ ] **Step 4: Create push toggle component for settings**

Create `components/settings/push-toggle.tsx`:

```tsx
"use client";

import { useState } from "react";

export function PushToggle({ enabled }: { enabled: boolean }) {
	const [status, setStatus] = useState<"idle" | "subscribing" | "done">(
		enabled ? "done" : "idle",
	);

	const handleSubscribe = async () => {
		setStatus("subscribing");

		try {
			const registration = await navigator.serviceWorker.register("/sw.js");
			await navigator.serviceWorker.ready;

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});

			await fetch("/api/push/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(subscription.toJSON()),
			});

			setStatus("done");
		} catch {
			setStatus("idle");
		}
	};

	if (status === "done") {
		return (
			<span className="text-xs text-success">Push notifications enabled</span>
		);
	}

	return (
		<button
			type="button"
			onClick={handleSubscribe}
			disabled={status === "subscribing"}
			className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
		>
			{status === "subscribing" ? "Enabling..." : "Enable Push Notifications"}
		</button>
	);
}
```

- [ ] **Step 5: Commit**

```bash
git add public/sw.js lib/services/push.ts app/api/push/ components/settings/push-toggle.tsx
git commit -m "feat: add push notifications with service worker, VAPID, and subscription API"
```

---

### Task 3: Email Digest Cron

**Files:**
- Create: `app/api/cron/digest/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create digest cron route**

Create `app/api/cron/digest/route.ts`:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createAdminClient();

	// Find users who want digests
	const { data: prefs } = await supabase
		.from("notification_preferences")
		.select("user_id, email_digest_frequency")
		.eq("email_digest_enabled", true);

	if (!prefs || prefs.length === 0) {
		return Response.json({ digests: 0 });
	}

	const today = new Date();
	const dayOfWeek = today.getDay();
	let digestsSent = 0;

	for (const pref of prefs) {
		// Weekly digests only on Mondays
		if (pref.email_digest_frequency === "weekly" && dayOfWeek !== 1) continue;

		// Get user email
		const { data: user } = await supabase
			.from("users")
			.select("email, display_name")
			.eq("id", pref.user_id)
			.single();

		if (!user) continue;

		// Get upcoming bills this week
		const weekFromNow = new Date(today);
		weekFromNow.setDate(weekFromNow.getDate() + 7);

		const { data: upcomingBills } = await supabase
			.from("bills")
			.select("amount, due_date, billers(name)")
			.eq("user_id", pref.user_id)
			.in("status", ["upcoming", "due_soon"])
			.lte("due_date", weekFromNow.toISOString().split("T")[0])
			.order("due_date", { ascending: true })
			.limit(10);

		// Get recent alerts
		const { data: recentAlerts } = await supabase
			.from("alerts")
			.select("title, severity")
			.eq("user_id", pref.user_id)
			.eq("is_dismissed", false)
			.order("created_at", { ascending: false })
			.limit(5);

		// Get overdue count
		const { count: overdueCount } = await supabase
			.from("bills")
			.select("*", { count: "exact", head: true })
			.eq("user_id", pref.user_id)
			.eq("status", "overdue");

		// Build email body (plain HTML — no React Email dependency needed)
		const billsHtml =
			upcomingBills && upcomingBills.length > 0
				? upcomingBills
						.map(
							(b) =>
								`<li>${(b as Record<string, unknown> & { billers: { name: string } }).billers?.name ?? "Unknown"}: <strong>$${Number(b.amount).toFixed(2)}</strong> due ${b.due_date}</li>`,
						)
						.join("")
				: "<li>No upcoming bills this week</li>";

		const alertsHtml =
			recentAlerts && recentAlerts.length > 0
				? recentAlerts.map((a) => `<li>${a.title}</li>`).join("")
				: "<li>No new alerts</li>";

		const html = `
			<h2>PayWatch Weekly Digest</h2>
			<p>Hi ${user.display_name || "there"},</p>
			${overdueCount && overdueCount > 0 ? `<p style="color: #ef4444;"><strong>${overdueCount} overdue bill(s)!</strong></p>` : ""}
			<h3>Upcoming Bills</h3>
			<ul>${billsHtml}</ul>
			<h3>Recent Alerts</h3>
			<ul>${alertsHtml}</ul>
			<p><a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://paywatch.app" : "http://localhost:3000"}/dashboard">View Dashboard</a></p>
		`;

		try {
			await resend.emails.send({
				from: "PayWatch <noreply@paywatch.app>",
				to: user.email,
				subject: `PayWatch Digest — ${upcomingBills?.length ?? 0} bills this week`,
				html,
			});
			digestsSent++;
		} catch (error) {
			console.error(`Failed to send digest to ${user.email}:`, error);
		}
	}

	return Response.json({ digests: digestsSent });
}
```

- [ ] **Step 2: Update vercel.json with digest cron**

Replace `vercel.json` with:

```json
{
	"crons": [
		{
			"path": "/api/cron/sync-all",
			"schedule": "*/15 * * * *"
		},
		{
			"path": "/api/cron/reminders",
			"schedule": "0 8 * * *"
		},
		{
			"path": "/api/cron/digest",
			"schedule": "0 8 * * *"
		}
	]
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/digest/ vercel.json
git commit -m "feat: add email digest cron job with Resend integration"
```

---

### Task 4: Push Notification Dispatch on Urgent Alerts + Reminders

**Files:**
- Modify: `lib/services/email-sync.ts`
- Modify: `app/api/cron/reminders/route.ts`

- [ ] **Step 1: Add push dispatch to the insertAlert helper in email-sync.ts**

Add these imports at the top of `lib/services/email-sync.ts`:

```typescript
import { sendPushNotification } from "./push";
```

Then modify the `insertAlert` function in `lib/services/email-sync.ts` to dispatch push notifications for urgent alerts:

```typescript
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
			// Respect quiet hours
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
```

- [ ] **Step 2: Add push dispatch to reminders cron**

In `app/api/cron/reminders/route.ts`, add push notification dispatch after marking bills as due_soon. Add this import at the top:

```typescript
import { sendPushNotification } from "@/lib/services/push";
```

Then inside the bills loop, after `await supabase.from("bills").update(...)`, add:

```typescript
			// Send push notification for due reminders
			const { data: notifPrefs } = await supabase
				.from("notification_preferences")
				.select("push_enabled, push_subscription")
				.eq("user_id", pref.user_id)
				.single();

			if (notifPrefs?.push_enabled && notifPrefs.push_subscription) {
				const billerName = (bill as Record<string, unknown> & { billers: { name: string } }).billers?.name ?? "Unknown";
				await sendPushNotification(
					notifPrefs.push_subscription as never,
					{
						title: `${billerName} — $${Number(bill.amount).toFixed(2)} due in ${pref.reminder_days_before} days`,
						body: `Due date: ${bill.due_date}`,
						url: "/dashboard/bills",
					},
				);
			}
```

- [ ] **Step 3: Commit**

```bash
git add lib/services/email-sync.ts app/api/cron/reminders/route.ts
git commit -m "feat: dispatch push notifications for urgent alerts and due date reminders"
```

---

### Task 5: Error Handling Hardening

**Files:**
- Modify: `lib/services/email-sync.ts`
- Create: `app/dashboard/error.tsx`

- [ ] **Step 1: Add Gmail token refresh to email-sync**

Add this function to `lib/services/email-sync.ts` and call it at the start of `syncEmailAccount`, before setting Gmail credentials:

```typescript
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

	return account;
}
```

Then at the top of `syncEmailAccount`, add:

```typescript
	// Refresh token if expired
	account = await refreshTokenIfNeeded(supabase, account);
	if (account.sync_status === "error") {
		return { billsCreated: 0, alertsCreated: 0, errors: ["Token refresh failed"] };
	}
```

- [ ] **Step 2: Add retry logic with exponential backoff for Gmail API**

Add this helper to `lib/services/email-sync.ts`:

```typescript
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
```

Then wrap the Gmail API calls in `syncEmailAccount`:

```typescript
	// Replace the direct gmail.users.messages.list call with:
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
```

- [ ] **Step 3: Create dashboard error boundary**

Create `app/dashboard/error.tsx`:

```tsx
"use client";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<h2 className="text-xl font-bold text-urgent">Something went wrong</h2>
			<p className="max-w-md text-sm text-muted">
				{error.message || "An unexpected error occurred. Please try again."}
			</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
			>
				Try again
			</button>
		</div>
	);
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/services/email-sync.ts app/dashboard/error.tsx
git commit -m "feat: add token refresh, retry with backoff, and dashboard error boundary"
```

---

### Task 6: Final Build Verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run the build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No lint errors. Fix any that appear.

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix: resolve build/lint issues from final verification"
```

(Skip if no fixes needed.)
