"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export function RealtimeAlerts({ userId }: { userId: string }) {
	const [newCount, setNewCount] = useState(0);
	const router = useRouter();

	useEffect(() => {
		const supabase = createClient();

		const channel = supabase
			.channel("alerts-realtime")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "alerts",
					filter: `user_id=eq.${userId}`,
				},
				() => {
					setNewCount((c) => c + 1);
					router.refresh();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, router]);

	if (newCount === 0) return null;

	return (
		<button
			type="button"
			onClick={() => {
				setNewCount(0);
				router.push("/dashboard/alerts");
			}}
			className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-accent/90 z-50"
		>
			<Bell size={16} />
			{newCount} new alert{newCount > 1 ? "s" : ""}
		</button>
	);
}
