import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const subscription = await request.json();

	const { error } = await supabase
		.from("notification_preferences")
		.update({
			push_subscription: subscription,
			push_enabled: true,
		})
		.eq("user_id", user.id);

	if (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	return Response.json({ success: true });
}
