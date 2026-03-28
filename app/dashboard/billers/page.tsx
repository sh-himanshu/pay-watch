import { createClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, string> = {
	subscription: "Subscription",
	utility: "Utility",
	credit_card: "Credit Card",
	insurance: "Insurance",
	other: "Other",
};

export default async function BillersPage() {
	const supabase = await createClient();

	const { data: billers } = await supabase
		.from("billers")
		.select("*, bills(count)")
		.order("name", { ascending: true });

	const allBillers = billers ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Billers</h1>

			{allBillers.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No billers detected yet. Sync your email to discover billers.
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{allBillers.map((biller) => (
						<div
							key={biller.id}
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
											? `$${Number(biller.typical_amount).toFixed(2)}`
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}
