import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "./login-button";

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm space-y-6 text-center">
				<h1 className="text-2xl font-bold">PayWatch</h1>
				<p className="text-sm text-foreground/60">
					Connect your Gmail to track bills and catch hidden fees.
				</p>
				<LoginButton />
			</div>
		</div>
	);
}
