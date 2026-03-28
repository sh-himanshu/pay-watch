import type { Bill, Biller } from "@/lib/types";

type BillWithBiller = Bill & { billers: Pick<Biller, "name"> };

export function UpcomingBills({ bills }: { bills: BillWithBiller[] }) {
	if (bills.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
				No upcoming bills found. Sync your email to get started.
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="border-b border-border px-5 py-3">
				<h2 className="text-sm font-semibold">Upcoming Bills</h2>
			</div>
			<div className="divide-y divide-border">
				{bills.map((bill) => (
					<div key={bill.id} className="flex items-center justify-between px-5 py-3">
						<div>
							<p className="text-sm font-medium">{bill.billers.name}</p>
							<p className="text-xs text-muted">Due {bill.due_date}</p>
						</div>
						<div className="text-right">
							<p className="font-mono text-sm font-medium">
								${Number(bill.amount).toFixed(2)}
							</p>
							<span
								className={`text-xs ${
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
					</div>
				))}
			</div>
		</div>
	);
}
