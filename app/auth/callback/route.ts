import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");

	if (code) {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error && data.session) {
			// Store Gmail tokens in email_accounts for later email sync
			const providerToken = data.session.provider_token;
			const providerRefreshToken = data.session.provider_refresh_token;
			const user = data.session.user;

			if (providerToken && user.email) {
				const { error: upsertError } = await supabase
					.from("email_accounts")
					.upsert(
						{
							user_id: user.id,
							provider: "gmail",
							email_address: user.email,
							access_token: providerToken,
							refresh_token: providerRefreshToken ?? "",
							token_expires_at: new Date(
								Date.now() + 3600 * 1000,
							).toISOString(),
							sync_status: "active",
						},
						{ onConflict: "user_id,email_address" },
					);

				if (upsertError) {
					console.error("Failed to store email account:", upsertError);
				}
			}

			return NextResponse.redirect(`${origin}/dashboard`);
		}
	}

	// Auth failed — redirect to login with error
	return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
