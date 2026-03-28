"use client";

import { motion } from "motion/react";
import { useCountry } from "@/components/country-provider";
import { staggerContainer, staggerItemLeft } from "@/lib/animations";

type BillRow = {
	id: string;
	amount: number;
	due_date: string;
	status: string;
	source_email_subject: string;
	confidence: number;
	billers: { name: string } | null;
};

export function BillsTable({ bills }: { bills: BillRow[] }) {
	const { formatCurrency } = useCountry();

	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-surface">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-border text-left text-xs text-muted">
						<th className="px-5 py-3 font-medium">Biller</th>
						<th className="px-5 py-3 font-medium">Amount</th>
						<th className="px-5 py-3 font-medium">Due Date</th>
						<th className="px-5 py-3 font-medium">Status</th>
						<th className="px-5 py-3 font-medium">Source</th>
						<th className="px-5 py-3 font-medium">Confidence</th>
					</tr>
				</thead>
				<motion.tbody
					className="divide-y divide-border"
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
				>
					{bills.map((bill) => (
						<motion.tr
							key={bill.id}
							variants={staggerItemLeft}
							className="hover:bg-white/[0.02]"
						>
							<td className="px-5 py-3 font-medium">
								{bill.billers?.name ?? "Unknown"}
							</td>
							<td className="px-5 py-3 font-mono">
								{formatCurrency(Number(bill.amount))}
							</td>
							<td className="px-5 py-3">{bill.due_date}</td>
							<td className="px-5 py-3">
								<span
									className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
										bill.status === "overdue"
											? "bg-urgent/10 text-urgent"
											: bill.status === "due_soon"
												? "bg-warning/10 text-warning"
												: bill.status === "paid"
													? "bg-success/10 text-success"
													: "bg-info/10 text-info"
									}`}
								>
									{bill.status}
								</span>
							</td>
							<td className="max-w-[200px] truncate px-5 py-3 text-muted">
								{bill.source_email_subject}
							</td>
							<td className="px-5 py-3 font-mono text-muted">
								{(Number(bill.confidence) * 100).toFixed(0)}%
							</td>
						</motion.tr>
					))}
				</motion.tbody>
			</table>
		</div>
	);
}
