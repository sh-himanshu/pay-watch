import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					response = NextResponse.next({ request });
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protect dashboard routes — redirect to login if not authenticated
	if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	// Redirect authenticated users away from login page
	if (user && request.nextUrl.pathname === "/login") {
		const url = request.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
};
