import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createAdminClient();

	// Find bills where due_date - reminder_days = today
	const { data: prefs } = await supabase
		.from("notification_preferences")
		.select("user_id, reminder_days_before")
		.eq("alert_due_reminder", true);

	if (!prefs) return Response.json({ reminders: 0 });

	let reminderCount = 0;

	for (const pref of prefs) {
		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() + pref.reminder_days_before);
		const dateStr = targetDate.toISOString().split("T")[0];

		const { data: bills } = await supabase
			.from("bills")
			.select("*, billers(name)")
			.eq("user_id", pref.user_id)
			.eq("due_date", dateStr)
			.in("status", ["upcoming", "due_soon"]);

		if (!bills) continue;

		// Update status to due_soon
		for (const bill of bills) {
			await supabase
				.from("bills")
				.update({ status: "due_soon" })
				.eq("id", bill.id);
			reminderCount++;
		}
	}

	// Also mark overdue bills
	const today = new Date().toISOString().split("T")[0];
	await supabase
		.from("bills")
		.update({ status: "overdue" })
		.lt("due_date", today)
		.in("status", ["upcoming", "due_soon"]);

	return Response.json({ reminders: reminderCount });
}
