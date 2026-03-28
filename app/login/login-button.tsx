"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
	const handleLogin = async () => {
		const supabase = createClient();
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				scopes: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
			},
		});
	};

	return (
		<button
			type="button"
			onClick={handleLogin}
			className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:bg-white/90"
		>
			Sign in with Google
		</button>
	);
}
