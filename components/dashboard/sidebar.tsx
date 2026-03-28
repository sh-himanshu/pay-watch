"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Receipt,
	Bell,
	Building2,
	Settings,
	Menu,
	X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/dashboard/bills", label: "Bills", icon: Receipt },
	{ href: "/dashboard/alerts", label: "Alerts", icon: Bell },
	{ href: "/dashboard/billers", label: "Billers", icon: Building2 },
	{ href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	const isActive = (href: string) =>
		href === "/dashboard" ? pathname === href : pathname.startsWith(href);

	const navContent = (
		<nav className="flex flex-col gap-1 px-3 py-4">
			<div className="mb-6 px-3">
				<h1 className="text-lg font-bold tracking-tight">PayWatch</h1>
			</div>
			{NAV_ITEMS.map((item) => {
				const Icon = item.icon;
				const active = isActive(item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						onClick={() => setMobileOpen(false)}
						className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
							active
								? "bg-accent/10 text-accent"
								: "text-muted hover:bg-white/5 hover:text-foreground"
						}`}
					>
						<Icon size={18} />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);

	return (
		<>
			{/* Mobile top bar */}
			<div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
				<h1 className="text-lg font-bold">PayWatch</h1>
				<button
					type="button"
					onClick={() => setMobileOpen(!mobileOpen)}
					className="text-muted hover:text-foreground"
				>
					{mobileOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div
						className="absolute inset-0 bg-black/60"
						onClick={() => setMobileOpen(false)}
						onKeyDown={() => {}}
						role="presentation"
					/>
					<div className="absolute left-0 top-0 h-full w-[260px] bg-background border-r border-border">
						{navContent}
					</div>
				</div>
			)}

			{/* Desktop sidebar */}
			<aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-border">
				{navContent}
			</aside>
		</>
	);
}
