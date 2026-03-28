"use client";

import type { Bill, Biller } from "@/lib/types";
import { Receipt, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useCountry } from "@/components/country-provider";
import { staggerContainer, staggerItemLeft } from "@/lib/animations";

type BillWithBiller = Bill & { billers: Pick<Biller, "name"> };

export function UpcomingBills({ bills }: { bills: BillWithBiller[] }) {
	const { formatCurrency } = useCountry();

	if (bills.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-8">
				<div className="flex flex-col items-center text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-info-light">
						<Mail size={24} className="text-info" />
					</div>
					<h3 className="mt-4 text-sm font-semibold">
						No upcoming bills
					</h3>
					<p className="mt-1 text-sm text-muted">
						Sync your email to detect bills automatically.
					</p>
					<Link
						href="/dashboard/settings"
						className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
					>
						<Mail size={16} />
						Sync email
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="flex items-center justify-between border-b border-border px-5 py-4">
				<h2 className="text-base font-semibold">Upcoming Bills</h2>
				<Link
					href="/dashboard/bills"
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
				{bills.map((bill) => (
					<motion.div
						key={bill.id}
						variants={staggerItemLeft}
						className="flex items-center justify-between px-5 py-3.5"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary">
								<Receipt
									size={16}
									className="text-muted"
								/>
							</div>
							<div>
								<p className="text-sm font-medium">
									{bill.billers.name}
								</p>
								<p className="text-sm text-muted">
									Due {bill.due_date}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-mono text-sm font-semibold">
								{formatCurrency(Number(bill.amount))}
							</p>
							<span
								className={`text-xs font-medium ${
									bill.status === "overdue"
										? "text-urgent"
										: bill.status === "due_soon"
											? "text-warning"
											: "text-muted"
								}`}
							>
								{bill.status === "overdue"
									? "Overdue"
									: bill.status === "due_soon"
										? "Due soon"
										: "Upcoming"}
							</span>
						</div>
					</motion.div>
				))}
			</motion.div>
		</div>
	);
}
