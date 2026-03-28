import { createClient } from "@/lib/supabase/server";
import { TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { AlertActions } from "@/components/alerts/alert-actions";

const ALERT_ICONS = {
	price_increase: TrendingUp,
	unexpected_charge: AlertTriangle,
	new_biller: Plus,
} as const;

const SEVERITY_COLORS = {
	urgent: "border-l-urgent",
	warning: "border-l-warning",
	info: "border-l-info",
} as const;

export default async function AlertsPage() {
	const supabase = await createClient();

	const { data: alerts } = await supabase
		.from("alerts")
		.select("*, billers(name)")
		.eq("is_dismissed", false)
		.order("created_at", { ascending: false });

	const allAlerts = alerts ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Alerts</h1>

			{allAlerts.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No alerts. We&apos;ll notify you when we detect anomalies.
				</div>
			) : (
				<div className="space-y-3">
					{allAlerts.map((alert) => {
						const Icon = ALERT_ICONS[alert.type as keyof typeof ALERT_ICONS] ?? AlertTriangle;
						return (
							<div
								key={alert.id}
								className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-surface border-l-2 px-5 py-4 ${SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] ?? ""} ${alert.is_read ? "opacity-60" : ""}`}
							>
								<div className="flex items-start gap-3">
									<Icon size={18} className="mt-0.5 shrink-0 text-muted" />
									<div>
										<p className="text-sm font-medium">{alert.title}</p>
										<p className="mt-1 text-xs text-muted">{alert.description}</p>
										<p className="mt-2 text-xs text-muted">
											{(alert as Record<string, unknown> & { billers: { name: string } }).billers?.name} &middot;{" "}
											{new Date(alert.created_at).toLocaleDateString()}
										</p>
									</div>
								</div>
								<AlertActions alertId={alert.id} isRead={alert.is_read} />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
