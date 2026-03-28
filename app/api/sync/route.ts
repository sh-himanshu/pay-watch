import { createClient } from "@/lib/supabase/server";
import { syncEmailAccount } from "@/lib/services/email-sync";
import type { EmailAccount } from "@/lib/types";

export async function POST() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("*")
		.eq("user_id", user.id)
		.eq("sync_status", "active");

	if (!accounts || accounts.length === 0) {
		return Response.json({ error: "No active email accounts" }, { status: 404 });
	}

	const results = [];
	for (const account of accounts) {
		const result = await syncEmailAccount(supabase, account as EmailAccount);
		results.push(result);
	}

	return Response.json({ results });
}
