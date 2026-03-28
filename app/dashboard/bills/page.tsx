import { createClient } from "@/lib/supabase/server";
import { BillsTable } from "./bills-table";

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
				<BillsTable bills={allBills as any} />
			)}
		</div>
	);
}
