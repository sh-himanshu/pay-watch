import webpush from "web-push";

webpush.setVapidDetails(
	"mailto:noreply@paywatch.app",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushNotification(
	subscription: webpush.PushSubscription,
	payload: { title: string; body: string; url?: string },
): Promise<boolean> {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
		return true;
	} catch {
		return false;
	}
}
