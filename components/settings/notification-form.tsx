"use client";

import { useState } from "react";
import type { NotificationPreferences } from "@/lib/types";
import { updateNotificationPreferences } from "@/app/dashboard/settings/actions";

export function NotificationForm({
	initial,
}: {
	initial: NotificationPreferences;
}) {
	const [prefs, setPrefs] = useState(initial);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		await updateNotificationPreferences(prefs);
		setSaving(false);
	};

	const toggle = (key: keyof NotificationPreferences) => {
		setPrefs((p) => ({ ...p, [key]: !p[key] }));
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<h3 className="text-sm font-semibold">Notification Channels</h3>

				<label className="flex items-center justify-between">
					<span className="text-sm">Push notifications</span>
					<input
						type="checkbox"
						checked={prefs.push_enabled}
						onChange={() => toggle("push_enabled")}
						className="accent-accent"
					/>
				</label>

				<label className="flex items-center justify-between">
					<span className="text-sm">Email digest</span>
					<input
						type="checkbox"
						checked={prefs.email_digest_enabled}
						onChange={() => toggle("email_digest_enabled")}
						className="accent-accent"
					/>
				</label>

				{prefs.email_digest_enabled && (
					<label className="flex items-center justify-between">
						<span className="text-sm text-muted">Digest frequency</span>
						<select
							value={prefs.email_digest_frequency}
							onChange={(e) =>
								setPrefs((p) => ({
									...p,
									email_digest_frequency: e.target.value as "daily" | "weekly",
								}))
							}
							className="rounded bg-background border border-border px-2 py-1 text-sm"
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
						</select>
					</label>
				)}
			</div>

			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<h3 className="text-sm font-semibold">Alert Types</h3>
				<label className="flex items-center justify-between">
					<span className="text-sm">Price increases</span>
					<input
						type="checkbox"
						checked={prefs.alert_price_increase}
						onChange={() => toggle("alert_price_increase")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">Unexpected charges</span>
					<input
						type="checkbox"
						checked={prefs.alert_unexpected_charge}
						onChange={() => toggle("alert_unexpected_charge")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">New billers</span>
					<input
						type="checkbox"
						checked={prefs.alert_new_biller}
						onChange={() => toggle("alert_new_biller")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">Due date reminders</span>
					<input
						type="checkbox"
						checked={prefs.alert_due_reminder}
						onChange={() => toggle("alert_due_reminder")}
						className="accent-accent"
					/>
				</label>
				{prefs.alert_due_reminder && (
					<label className="flex items-center justify-between">
						<span className="text-sm text-muted">Remind days before</span>
						<input
							type="number"
							min={1}
							max={14}
							value={prefs.reminder_days_before}
							onChange={(e) =>
								setPrefs((p) => ({
									...p,
									reminder_days_before: Number(e.target.value),
								}))
							}
							className="w-16 rounded bg-background border border-border px-2 py-1 text-sm font-mono text-center"
						/>
					</label>
				)}
			</div>

			<button
				type="button"
				onClick={handleSave}
				disabled={saving}
				className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
			>
				{saving ? "Saving..." : "Save Preferences"}
			</button>
		</div>
	);
}
