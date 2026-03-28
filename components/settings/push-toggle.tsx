"use client";

import { useState } from "react";

export function PushToggle({ enabled }: { enabled: boolean }) {
	const [status, setStatus] = useState<"idle" | "subscribing" | "done">(
		enabled ? "done" : "idle",
	);

	const handleSubscribe = async () => {
		setStatus("subscribing");

		try {
			const registration = await navigator.serviceWorker.register("/sw.js");
			await navigator.serviceWorker.ready;

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});

			await fetch("/api/push/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(subscription.toJSON()),
			});

			setStatus("done");
		} catch {
			setStatus("idle");
		}
	};

	if (status === "done") {
		return (
			<span className="text-xs text-success">Push notifications enabled</span>
		);
	}

	return (
		<button
			type="button"
			onClick={handleSubscribe}
			disabled={status === "subscribing"}
			className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
		>
			{status === "subscribing" ? "Enabling..." : "Enable Push Notifications"}
		</button>
	);
}
