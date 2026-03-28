"use client";

import { useRouter } from "next/navigation";

export function AlertActions({
	alertId,
	isRead,
}: {
	alertId: string;
	isRead: boolean;
}) {
	const router = useRouter();

	const handleAction = async (action: "read" | "dismiss") => {
		await fetch(`/api/alerts/${alertId}/${action}`, { method: "PATCH" });
		router.refresh();
	};

	return (
		<div className="flex gap-2">
			{!isRead && (
				<button
					type="button"
					onClick={() => handleAction("read")}
					className="rounded px-2 py-1 text-xs text-muted hover:bg-white/5 hover:text-foreground"
				>
					Mark read
				</button>
			)}
			<button
				type="button"
				onClick={() => handleAction("dismiss")}
				className="rounded px-2 py-1 text-xs text-muted hover:bg-white/5 hover:text-urgent"
			>
				Dismiss
			</button>
		</div>
	);
}
