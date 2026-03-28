import type { Alert, Biller } from "@/lib/types";
import { TrendingUp, AlertTriangle, Plus } from "lucide-react";

type AlertWithBiller = Alert & { billers: Pick<Biller, "name"> };

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

export function RecentAlerts({ alerts }: { alerts: AlertWithBiller[] }) {
	if (alerts.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
				No alerts yet. We&apos;ll notify you when we detect anomalies.
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="border-b border-border px-5 py-3">
				<h2 className="text-sm font-semibold">Recent Alerts</h2>
			</div>
			<div className="divide-y divide-border">
				{alerts.map((alert) => {
					const Icon = ALERT_ICONS[alert.type];
					return (
						<div
							key={alert.id}
							className={`flex items-start gap-3 border-l-2 px-5 py-3 ${SEVERITY_COLORS[alert.severity]}`}
						>
							<Icon size={16} className="mt-0.5 shrink-0 text-muted" />
							<div>
								<p className="text-sm font-medium">{alert.title}</p>
								<p className="text-xs text-muted">{alert.description}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
