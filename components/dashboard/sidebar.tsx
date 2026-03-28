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
import { motion } from "motion/react";

const MAIN_NAV = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/dashboard/bills", label: "Bills", icon: Receipt },
	{ href: "/dashboard/alerts", label: "Alerts", icon: Bell },
	{ href: "/dashboard/billers", label: "Billers", icon: Building2 },
];

const ACCOUNT_NAV = [
	{ href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	const isActive = (href: string) =>
		href === "/dashboard" ? pathname === href : pathname.startsWith(href);

	const navContent = (
		<div className="flex h-full flex-col">
			{/* Brand */}
			<div className="flex h-16 shrink-0 items-center border-b border-border px-6">
				<Link
					href="/dashboard"
					className="text-lg font-bold tracking-tight text-foreground"
				>
					PayWatch
				</Link>
			</div>

			{/* Main navigation */}
			<nav className="flex flex-1 flex-col px-3 pt-6">
				<p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
					Main
				</p>
				<div className="flex flex-col gap-0.5">
					{MAIN_NAV.map((item) => {
						const Icon = item.icon;
						const active = isActive(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setMobileOpen(false)}
								aria-current={active ? "page" : undefined}
								className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									active
										? "text-accent"
										: "text-muted hover:bg-surface-secondary hover:text-foreground"
								}`}
							>
								{active && (
									<motion.div
										layoutId="sidebar-active"
										className="absolute inset-0 rounded-lg bg-accent-light"
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
									/>
								)}
								<span className="relative z-10 flex items-center gap-3">
									<Icon size={18} />
									{item.label}
								</span>
							</Link>
						);
					})}
				</div>

				{/* Account section */}
				<p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
					Account
				</p>
				<div className="flex flex-col gap-0.5">
					{ACCOUNT_NAV.map((item) => {
						const Icon = item.icon;
						const active = isActive(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setMobileOpen(false)}
								aria-current={active ? "page" : undefined}
								className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									active
										? "text-accent"
										: "text-muted hover:bg-surface-secondary hover:text-foreground"
								}`}
							>
								{active && (
									<motion.div
										layoutId="sidebar-active"
										className="absolute inset-0 rounded-lg bg-accent-light"
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
									/>
								)}
								<span className="relative z-10 flex items-center gap-3">
									<Icon size={18} />
									{item.label}
								</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);

	return (
		<>
			{/* Mobile top bar */}
			<div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
				<Link
					href="/dashboard"
					className="text-lg font-bold tracking-tight text-foreground"
				>
					PayWatch
				</Link>
				<button
					type="button"
					onClick={() => setMobileOpen(!mobileOpen)}
					className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
					aria-label={mobileOpen ? "Close menu" : "Open menu"}
				>
					{mobileOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div
						className="absolute inset-0 bg-black/20 backdrop-blur-sm"
						onClick={() => setMobileOpen(false)}
						onKeyDown={() => {}}
						role="presentation"
					/>
					<div className="absolute left-0 top-0 h-full w-[280px] bg-surface shadow-xl">
						{navContent}
					</div>
				</div>
			)}

			{/* Desktop sidebar */}
			<aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
				{navContent}
			</aside>
		</>
	);
}
