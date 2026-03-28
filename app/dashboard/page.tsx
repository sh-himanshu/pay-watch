import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Fetch summary data
	const now = new Date();
	const weekFromNow = new Date(now);
	weekFromNow.setDate(weekFromNow.getDate() + 7);
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		.toISOString()
		.split("T")[0];

	const [dueThisWeekRes, overdueRes, monthlyRes, alertCountRes, billsRes, alertsRes] =
		await Promise.all([
			supabase
				.from("bills")
				.select("*", { count: "exact", head: true })
				.lte("due_date", weekFromNow.toISOString().split("T")[0])
				.gte("due_date", now.toISOString().split("T")[0])
				.in("status", ["upcoming", "due_soon"]),
			supabase
				.from("bills")
				.select("*", { count: "exact", head: true })
				.eq("status", "overdue"),
			supabase
				.from("bills")
				.select("amount")
				.gte("due_date", startOfMonth),
			supabase
				.from("alerts")
				.select("*", { count: "exact", head: true })
				.eq("is_dismissed", false)
				.eq("is_read", false),
			supabase
				.from("bills")
				.select("*, billers(name)")
				.in("status", ["upcoming", "due_soon", "overdue"])
				.order("due_date", { ascending: true })
				.limit(5),
			supabase
				.from("alerts")
				.select("*, billers(name)")
				.eq("is_dismissed", false)
				.order("created_at", { ascending: false })
				.limit(5),
		]);

	const monthlyTotal = (monthlyRes.data ?? []).reduce(
		(sum, b) => sum + Number(b.amount),
		0,
	);

	const firstName = (
		user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"
	);

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<div>
				<h1 className="text-2xl font-semibold">
					Welcome back, {firstName}
				</h1>
				<p className="mt-1 text-sm text-muted">
					Here's an overview of your bills and alerts.
				</p>
			</div>

			<SummaryCards
				data={{
					dueThisWeek: dueThisWeekRes.count ?? 0,
					overdue: overdueRes.count ?? 0,
					monthlyTotal,
					activeAlerts: alertCountRes.count ?? 0,
				}}
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<UpcomingBills bills={(billsRes.data as never[]) ?? []} />
				<RecentAlerts alerts={(alertsRes.data as never[]) ?? []} />
			</div>
		</div>
	);
}
