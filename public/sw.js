self.addEventListener("push", (event) => {
	const data = event.data ? event.data.json() : {};
	const title = data.title || "PayWatch";
	const options = {
		body: data.body || "You have a new notification",
		icon: "/favicon.ico",
		badge: "/favicon.ico",
		data: { url: data.url || "/dashboard" },
	};
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url || "/dashboard";
	event.waitUntil(clients.openWindow(url));
});
