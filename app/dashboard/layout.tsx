import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
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

	const userData = {
		email: user.email ?? "",
		name: user.user_metadata?.full_name ?? null,
		avatarUrl: user.user_metadata?.avatar_url ?? null,
	};

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-auto">
				<Header user={userData} />
				<main className="flex-1">{children}</main>
			</div>
			<RealtimeAlerts userId={user.id} />
		</div>
	);
}
