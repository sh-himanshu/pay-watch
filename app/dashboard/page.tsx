import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<p className="mt-2 text-foreground/60">
				Welcome, {user?.user_metadata?.full_name ?? user?.email}
			</p>
			<p className="mt-4 text-sm text-foreground/40">
				Phase 1 complete. Dashboard UI coming in Phase 3.
			</p>
		</div>
	);
}
