import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RealtimeAlerts } from "@/components/dashboard/realtime-alerts";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<Sidebar />
			<main className="flex-1 overflow-auto">{children}</main>
			<RealtimeAlerts userId={user.id} />
		</div>
	);
}
