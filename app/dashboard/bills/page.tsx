import { createClient } from "@/lib/supabase/server";

export default async function BillsPage() {
	const supabase = await createClient();

	const { data: bills } = await supabase
		.from("bills")
		.select("*, billers(name, category)")
		.order("due_date", { ascending: true });

	const allBills = bills ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Bills</h1>

			{allBills.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No bills found. Sync your email to detect bills automatically.
				</div>
			) : (
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
						<tbody className="divide-y divide-border">
							{allBills.map((bill) => (
								<tr key={bill.id} className="hover:bg-white/[0.02]">
									<td className="px-5 py-3 font-medium">
										{(bill as Record<string, unknown> & { billers: { name: string } }).billers?.name ?? "Unknown"}
									</td>
									<td className="px-5 py-3 font-mono">
										${Number(bill.amount).toFixed(2)}
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
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
