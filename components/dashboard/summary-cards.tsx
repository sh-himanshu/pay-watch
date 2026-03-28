import { Receipt, AlertTriangle, DollarSign, Bell } from "lucide-react";

type SummaryData = {
	dueThisWeek: number;
	overdue: number;
	monthlyTotal: number;
	activeAlerts: number;
};

export function SummaryCards({ data }: { data: SummaryData }) {
	const cards = [
		{
			label: "Due This Week",
			value: data.dueThisWeek,
			icon: Receipt,
			color: "text-info",
		},
		{
			label: "Overdue",
			value: data.overdue,
			icon: AlertTriangle,
			color: "text-urgent",
		},
		{
			label: "Monthly Total",
			value: `$${data.monthlyTotal.toFixed(2)}`,
			icon: DollarSign,
			color: "text-success",
			mono: true,
		},
		{
			label: "Active Alerts",
			value: data.activeAlerts,
			icon: Bell,
			color: "text-warning",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div
						key={card.label}
						className="rounded-xl border border-border bg-surface p-5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted">{card.label}</span>
							<Icon size={16} className={card.color} />
						</div>
						<p
							className={`mt-2 text-2xl font-bold ${card.mono ? "font-mono" : ""}`}
						>
							{card.value}
						</p>
					</div>
				);
			})}
		</div>
	);
}
