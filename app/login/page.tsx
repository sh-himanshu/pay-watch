import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "./login-button";
import { Shield } from "lucide-react";

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="w-full max-w-sm space-y-8 text-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">PayWatch</h1>
					<p className="mt-2 text-sm text-muted">
						Track bills. Catch fees. Never miss a payment.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-surface p-6 space-y-6">
					<LoginButton />

					<div className="flex items-start gap-3 text-left">
						<Shield size={16} className="mt-0.5 shrink-0 text-accent" />
						<p className="text-xs text-muted">
							We use read-only Gmail access to find bills. We never send, modify,
							or delete your emails. Only billing details (amount, due date,
							biller name) are stored.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
