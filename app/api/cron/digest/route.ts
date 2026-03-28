import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function GET(request: Request) {
	const resend = new Resend(process.env.RESEND_API_KEY);
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

		// Build email body (plain HTML)
		const billsHtml =
			upcomingBills && upcomingBills.length > 0
				? upcomingBills
						.map(
							(b) =>
								`<li>${((b as unknown as { billers: { name: string } }).billers?.name) ?? "Unknown"}: <strong>$${Number(b.amount).toFixed(2)}</strong> due ${b.due_date}</li>`,
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
			<p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard">View Dashboard</a></p>
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
