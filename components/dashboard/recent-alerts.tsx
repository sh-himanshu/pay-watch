"use client";

import type { Alert, Biller } from "@/lib/types";
import { TrendingUp, AlertTriangle, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { staggerContainer, staggerItemLeft } from "@/lib/animations";

type AlertWithBiller = Alert & { billers: Pick<Biller, "name"> };

const ALERT_ICONS = {
	price_increase: TrendingUp,
	unexpected_charge: AlertTriangle,
	new_biller: Plus,
} as const;

const SEVERITY_STYLES = {
	urgent: { border: "border-l-urgent", bg: "bg-urgent-light" },
	warning: { border: "border-l-warning", bg: "bg-warning-light" },
	info: { border: "border-l-info", bg: "bg-info-light" },
} as const;

export function RecentAlerts({ alerts }: { alerts: AlertWithBiller[] }) {
	if (alerts.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-8">
				<div className="flex flex-col items-center text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
						<ShieldCheck size={24} className="text-success" />
					</div>
					<h3 className="mt-4 text-sm font-semibold">
						All clear
					</h3>
					<p className="mt-1 text-sm text-muted">
						No anomalies detected. We'll notify you when something
						needs attention.
					</p>
					<Link
						href="/dashboard/settings"
						className="mt-4 inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary"
					>
						Configure alerts
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="flex items-center justify-between border-b border-border px-5 py-4">
				<h2 className="text-base font-semibold">Recent Alerts</h2>
				<Link
					href="/dashboard/alerts"
					className="text-sm font-medium text-accent hover:underline"
				>
					View all
				</Link>
			</div>
			<motion.div
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				className="divide-y divide-border"
			>
				{alerts.map((alert) => {
					const Icon = ALERT_ICONS[alert.type];
					const styles = SEVERITY_STYLES[alert.severity];
					return (
						<motion.div
							key={alert.id}
							variants={staggerItemLeft}
							className={`flex items-start gap-3 border-l-2 px-5 py-3.5 ${styles.border}`}
						>
							<div
								className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${styles.bg}`}
							>
								<Icon size={14} className="text-muted" />
							</div>
							<div>
								<p className="text-sm font-medium">
									{alert.title}
								</p>
								<p className="mt-0.5 text-sm text-muted">
									{alert.description}
								</p>
							</div>
						</motion.div>
					);
				})}
			</motion.div>
		</div>
	);
}
