"use client";

import { motion } from "motion/react";
import { useCountry } from "@/components/country-provider";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/animations";

const CATEGORY_LABELS: Record<string, string> = {
	subscription: "Subscription",
	utility: "Utility",
	credit_card: "Credit Card",
	insurance: "Insurance",
	other: "Other",
};

type BillerRow = {
	id: string;
	name: string;
	category: string;
	typical_amount: number | null;
	billing_frequency: string;
	first_seen_at: string;
	bills: { count: number }[] | number;
};

export function BillersGrid({ billers }: { billers: BillerRow[] }) {
	const { formatCurrency } = useCountry();

	return (
		<motion.div
			className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
		>
			{billers.map((biller) => (
				<motion.div
					key={biller.id}
					variants={staggerItem}
					{...hoverLift}
					className="rounded-xl border border-border bg-surface p-5"
				>
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">{biller.name}</h3>
						<span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
							{CATEGORY_LABELS[biller.category] ?? biller.category}
						</span>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-4">
						<div>
							<p className="text-xs text-muted">Typical Amount</p>
							<p className="mt-1 font-mono text-sm font-medium">
								{biller.typical_amount
									? formatCurrency(Number(biller.typical_amount))
									: "\u2014"}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted">Frequency</p>
							<p className="mt-1 text-sm capitalize">{biller.billing_frequency}</p>
						</div>
						<div>
							<p className="text-xs text-muted">Bills</p>
							<p className="mt-1 text-sm">
								{Array.isArray(biller.bills)
									? (biller.bills[0] as { count: number })?.count ?? 0
									: 0}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted">First Seen</p>
							<p className="mt-1 text-sm">
								{new Date(biller.first_seen_at).toLocaleDateString()}
							</p>
						</div>
					</div>
				</motion.div>
			))}
		</motion.div>
	);
}
