import { createAdminClient } from "@/lib/supabase/admin";
import { syncEmailAccount } from "@/lib/services/email-sync";
import type { EmailAccount } from "@/lib/types";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createAdminClient();

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("*")
		.eq("sync_status", "active");

	if (!accounts || accounts.length === 0) {
		return Response.json({ message: "No accounts to sync" });
	}

	const results = [];
	for (const account of accounts) {
		const result = await syncEmailAccount(supabase, account as EmailAccount);
		results.push({ account_id: account.id, ...result });
	}

	return Response.json({ synced: accounts.length, results });
}
