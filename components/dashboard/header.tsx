"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/dashboard/actions";
import { CountryToggle } from "@/components/country-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

type HeaderProps = {
	user: {
		email: string;
		name: string | null;
		avatarUrl: string | null;
	};
};

export function Header({ user }: HeaderProps) {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const initial = (user.name?.[0] ?? user.email[0] ?? "?").toUpperCase();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
			<div />

			<div className="flex items-center gap-2">
				{/* Search */}
				<button
					type="button"
					className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					aria-label="Search"
				>
					<Search size={18} />
				</button>

				{/* Notifications */}
				<button
					type="button"
					className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					aria-label="Notifications"
				>
					<Bell size={18} />
				</button>

				{/* Country toggle */}
				<CountryToggle />

				{/* Theme toggle */}
				<ThemeToggle />

				{/* Separator */}
				<div className="mx-1 h-6 w-px bg-border" />

				{/* User dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						type="button"
						onClick={() => setDropdownOpen(!dropdownOpen)}
						className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						aria-expanded={dropdownOpen}
						aria-haspopup="true"
					>
						{user.avatarUrl ? (
							<img
								src={user.avatarUrl}
								alt=""
								className="h-7 w-7 rounded-full"
							/>
						) : (
							<div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
								{initial}
							</div>
						)}
						<span className="hidden text-sm font-medium sm:block">
							{user.name ?? user.email.split("@")[0]}
						</span>
						<ChevronDown
							size={14}
							className={`text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>

					{dropdownOpen && (
						<div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface p-1 shadow-lg">
							<div className="border-b border-border px-3 py-2.5">
								<p className="text-sm font-medium">
									{user.name ?? "User"}
								</p>
								<p className="text-xs text-muted">
									{user.email}
								</p>
							</div>
							<div className="py-1">
								<Link
									href="/dashboard/settings"
									onClick={() => setDropdownOpen(false)}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
								>
									<Settings size={16} />
									Settings
								</Link>
							</div>
							<div className="border-t border-border py-1">
								<form action={signOut}>
									<button
										type="submit"
										className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-urgent transition-colors hover:bg-urgent-light"
									>
										<LogOut size={16} />
										Sign out
									</button>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
