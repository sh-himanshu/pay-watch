import { createClient } from "@/lib/supabase/server";
import { NotificationForm } from "@/components/settings/notification-form";
import type { NotificationPreferences } from "@/lib/types";

export default async function SettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: prefs } = await supabase
		.from("notification_preferences")
		.select("*")
		.eq("user_id", user!.id)
		.single();

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("email_address, sync_status, last_synced_at")
		.eq("user_id", user!.id);

	return (
		<div className="space-y-8 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Settings</h1>

			{/* Connected Accounts */}
			<div>
				<h2 className="mb-4 text-lg font-semibold">Connected Accounts</h2>
				<div className="space-y-3">
					{(accounts ?? []).map((account) => (
						<div
							key={account.email_address}
							className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
						>
							<div>
								<p className="text-sm font-medium">{account.email_address}</p>
								<p className="text-xs text-muted">
									Last synced:{" "}
									{account.last_synced_at
										? new Date(account.last_synced_at).toLocaleString()
										: "Never"}
								</p>
							</div>
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-medium ${
									account.sync_status === "active"
										? "bg-success/10 text-success"
										: account.sync_status === "error"
											? "bg-urgent/10 text-urgent"
											: "bg-muted/10 text-muted"
								}`}
							>
								{account.sync_status}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Notification Preferences */}
			<div>
				<h2 className="mb-4 text-lg font-semibold">Notifications</h2>
				{prefs ? (
					<NotificationForm initial={prefs as NotificationPreferences} />
				) : (
					<p className="text-sm text-muted">
						Notification preferences not found.
					</p>
				)}
			</div>
		</div>
	);
}
