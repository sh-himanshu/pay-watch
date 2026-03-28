"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/lib/types";

export async function updateNotificationPreferences(
	prefs: NotificationPreferences,
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "Not authenticated" };
	}

	const { error } = await supabase
		.from("notification_preferences")
		.update({
			push_enabled: prefs.push_enabled,
			email_digest_enabled: prefs.email_digest_enabled,
			email_digest_frequency: prefs.email_digest_frequency,
			quiet_hours_start: prefs.quiet_hours_start,
			quiet_hours_end: prefs.quiet_hours_end,
			alert_price_increase: prefs.alert_price_increase,
			alert_unexpected_charge: prefs.alert_unexpected_charge,
			alert_new_biller: prefs.alert_new_biller,
			alert_due_reminder: prefs.alert_due_reminder,
			reminder_days_before: prefs.reminder_days_before,
		})
		.eq("id", prefs.id)
		.eq("user_id", user.id);

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}
