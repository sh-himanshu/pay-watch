import { createClient } from "@/lib/supabase/server";
import { BillersGrid } from "./billers-grid";

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
				<BillersGrid billers={allBillers as any} />
			)}
		</div>
	);
}
