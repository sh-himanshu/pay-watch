# PayWatch Phase 3: UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all 7 pages with the Dark Cinema design system — landing, login, dashboard shell with sidebar, dashboard home, bills, alerts, billers, and settings pages.

**Architecture:** Server components for data fetching, client components only where interactivity is needed (filters, buttons, sidebar toggle). Dashboard pages share a sidebar layout. Landing page is full-width marketing.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide React icons, Inter + JetBrains Mono fonts

**Spec references:** `docs/superpowers/specs/paywatch/05-ui-pages.md`

**Prerequisites:** Phase 1 complete (auth, DB). Phase 2 recommended but not strictly required (UI can render empty states).

**IMPORTANT:** Before writing any code, read `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` for the correct Next.js 16 font API. Read `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` for layout nesting patterns.

---

### Task 1: Design System Tokens

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update globals.css with PayWatch design tokens**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

:root {
	--pw-bg: #09090f;
	--pw-surface: #16161f;
	--pw-border: rgba(255, 255, 255, 0.06);
	--pw-accent: #5e6ad2;
	--pw-text: #e4e4e7;
	--pw-text-muted: #71717a;
	--pw-red: #ef4444;
	--pw-amber: #f59e0b;
	--pw-green: #22c55e;
	--pw-blue: #3b82f6;
	--pw-purple: #a855f7;
}

@theme inline {
	--color-background: var(--pw-bg);
	--color-foreground: var(--pw-text);
	--color-surface: var(--pw-surface);
	--color-border: var(--pw-border);
	--color-accent: var(--pw-accent);
	--color-muted: var(--pw-text-muted);
	--color-urgent: var(--pw-red);
	--color-warning: var(--pw-amber);
	--color-success: var(--pw-green);
	--color-info: var(--pw-blue);
	--color-new: var(--pw-purple);
	--font-sans: var(--font-inter);
	--font-mono: var(--font-jetbrains);
}

body {
	background: var(--pw-bg);
	color: var(--pw-text);
	font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 2: Update root layout with correct fonts and metadata**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PayWatch — Track Bills, Catch Hidden Fees",
	description:
		"Connect your Gmail and PayWatch automatically finds every bill, tracks due dates, and catches price increases before they cost you money.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
```

- [ ] **Step 3: Verify dev server renders with correct background**

```bash
pnpm dev
```

Open `http://localhost:3000` — should show dark navy background (`#09090f`).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add PayWatch design system tokens and update fonts to Inter + JetBrains Mono"
```

---

### Task 2: Dashboard Sidebar Layout

**Files:**
- Modify: `app/dashboard/layout.tsx`
- Create: `components/dashboard/sidebar.tsx`

- [ ] **Step 1: Create sidebar component**

Create `components/dashboard/sidebar.tsx`:

```tsx
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
```

- [ ] **Step 2: Update dashboard layout**

Replace `app/dashboard/layout.tsx` with:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<Sidebar />
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/sidebar.tsx app/dashboard/layout.tsx
git commit -m "feat: add dashboard sidebar layout with responsive mobile overlay"
```

---

### Task 3: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Build the landing page**

Replace `app/page.tsx` with:

```tsx
import Link from "next/link";
import { Shield, Zap, Bell, Eye } from "lucide-react";

const FEATURES = [
	{
		icon: Eye,
		title: "Auto-Detect Bills",
		description:
			"Scans your Gmail to find every bill, subscription, and recurring charge automatically.",
	},
	{
		icon: Zap,
		title: "Catch Price Increases",
		description:
			"Alerts you when a biller raises prices — even by a few dollars — before the charge hits.",
	},
	{
		icon: Bell,
		title: "Never Miss a Due Date",
		description:
			"Smart reminders for upcoming bills with push notifications and email digests.",
	},
	{
		icon: Shield,
		title: "Spot Hidden Fees",
		description:
			"Detects late fees, service charges, and unexpected amounts you'd otherwise miss.",
	},
];

export default function LandingPage() {
	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="relative flex flex-col items-center justify-center px-6 py-24 text-center lg:py-36">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(94,106,210,0.08)_0%,_transparent_70%)]" />
				<div className="relative z-10 max-w-2xl">
					<h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
						Your bills,{" "}
						<span className="text-accent">watched.</span>
					</h1>
					<p className="mt-4 text-lg text-muted lg:text-xl">
						Connect Gmail once. PayWatch finds every bill, tracks due dates, and
						catches fees you&apos;d otherwise miss.
					</p>
					<div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<Link
							href="/login"
							className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
						>
							Get Started Free
						</Link>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border px-6 py-20">
				<div className="mx-auto max-w-5xl">
					<h2 className="text-center text-2xl font-bold lg:text-3xl">
						Stop losing money to hidden fees
					</h2>
					<p className="mt-3 text-center text-muted">
						Most people overpay by $500+/year on fees they never notice.
					</p>
					<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{FEATURES.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="rounded-xl border border-border bg-surface p-6"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
										<Icon size={20} className="text-accent" />
									</div>
									<h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
									<p className="mt-2 text-sm text-muted">{feature.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Trust / Privacy */}
			<section className="border-t border-border px-6 py-20">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-2xl font-bold">Privacy first</h2>
					<p className="mt-3 text-muted">
						PayWatch uses read-only Gmail access. We never store your email
						content — only the billing details we extract (amount, due date,
						biller name). Your data is protected with row-level security.
					</p>
				</div>
			</section>

			{/* Footer CTA */}
			<section className="border-t border-border px-6 py-16 text-center">
				<h2 className="text-xl font-bold">Ready to take control of your bills?</h2>
				<Link
					href="/login"
					className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
				>
					Sign in with Google
				</Link>
			</section>
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with hero, features, trust section, and CTA"
```

---

### Task 4: Login Page (Full Design)

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/login/login-button.tsx`

- [ ] **Step 1: Update login page with full design**

Replace `app/login/page.tsx` with:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "./login-button";
import { Shield } from "lucide-react";

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="w-full max-w-sm space-y-8 text-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">PayWatch</h1>
					<p className="mt-2 text-sm text-muted">
						Track bills. Catch fees. Never miss a payment.
					</p>
				</div>

				<div className="rounded-xl border border-border bg-surface p-6 space-y-6">
					<LoginButton />

					<div className="flex items-start gap-3 text-left">
						<Shield size={16} className="mt-0.5 shrink-0 text-accent" />
						<p className="text-xs text-muted">
							We use read-only Gmail access to find bills. We never send, modify,
							or delete your emails. Only billing details (amount, due date,
							biller name) are stored.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Update login button styling**

Replace `app/login/login-button.tsx` with:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
	const handleLogin = async () => {
		const supabase = createClient();
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				scopes:
					"openid email profile https://www.googleapis.com/auth/gmail.readonly",
			},
		});
	};

	return (
		<button
			type="button"
			onClick={handleLogin}
			className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				/>
			</svg>
			Sign in with Google
		</button>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/
git commit -m "feat: redesign login page with privacy explanation and Google branding"
```

---

### Task 5: Dashboard Home Page

**Files:**
- Modify: `app/dashboard/page.tsx`
- Create: `components/dashboard/summary-cards.tsx`
- Create: `components/dashboard/upcoming-bills.tsx`
- Create: `components/dashboard/recent-alerts.tsx`

- [ ] **Step 1: Create summary cards component**

Create `components/dashboard/summary-cards.tsx`:

```tsx
import { Receipt, AlertTriangle, DollarSign, Bell } from "lucide-react";

type SummaryData = {
	dueThisWeek: number;
	overdue: number;
	monthlyTotal: number;
	activeAlerts: number;
};

export function SummaryCards({ data }: { data: SummaryData }) {
	const cards = [
		{
			label: "Due This Week",
			value: data.dueThisWeek,
			icon: Receipt,
			color: "text-info",
		},
		{
			label: "Overdue",
			value: data.overdue,
			icon: AlertTriangle,
			color: "text-urgent",
		},
		{
			label: "Monthly Total",
			value: `$${data.monthlyTotal.toFixed(2)}`,
			icon: DollarSign,
			color: "text-success",
			mono: true,
		},
		{
			label: "Active Alerts",
			value: data.activeAlerts,
			icon: Bell,
			color: "text-warning",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div
						key={card.label}
						className="rounded-xl border border-border bg-surface p-5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted">{card.label}</span>
							<Icon size={16} className={card.color} />
						</div>
						<p
							className={`mt-2 text-2xl font-bold ${card.mono ? "font-mono" : ""}`}
						>
							{card.value}
						</p>
					</div>
				);
			})}
		</div>
	);
}
```

- [ ] **Step 2: Create upcoming bills component**

Create `components/dashboard/upcoming-bills.tsx`:

```tsx
import type { Bill, Biller } from "@/lib/types";

type BillWithBiller = Bill & { billers: Pick<Biller, "name"> };

export function UpcomingBills({ bills }: { bills: BillWithBiller[] }) {
	if (bills.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
				No upcoming bills found. Sync your email to get started.
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="border-b border-border px-5 py-3">
				<h2 className="text-sm font-semibold">Upcoming Bills</h2>
			</div>
			<div className="divide-y divide-border">
				{bills.map((bill) => (
					<div key={bill.id} className="flex items-center justify-between px-5 py-3">
						<div>
							<p className="text-sm font-medium">{bill.billers.name}</p>
							<p className="text-xs text-muted">Due {bill.due_date}</p>
						</div>
						<div className="text-right">
							<p className="font-mono text-sm font-medium">
								${Number(bill.amount).toFixed(2)}
							</p>
							<span
								className={`text-xs ${
									bill.status === "overdue"
										? "text-urgent"
										: bill.status === "due_soon"
											? "text-warning"
											: "text-muted"
								}`}
							>
								{bill.status === "overdue"
									? "Overdue"
									: bill.status === "due_soon"
										? "Due soon"
										: "Upcoming"}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
```

- [ ] **Step 3: Create recent alerts component**

Create `components/dashboard/recent-alerts.tsx`:

```tsx
import type { Alert, Biller } from "@/lib/types";
import { TrendingUp, AlertTriangle, Plus } from "lucide-react";

type AlertWithBiller = Alert & { billers: Pick<Biller, "name"> };

const ALERT_ICONS = {
	price_increase: TrendingUp,
	unexpected_charge: AlertTriangle,
	new_biller: Plus,
} as const;

const SEVERITY_COLORS = {
	urgent: "border-l-urgent",
	warning: "border-l-warning",
	info: "border-l-info",
} as const;

export function RecentAlerts({ alerts }: { alerts: AlertWithBiller[] }) {
	if (alerts.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
				No alerts yet. We&apos;ll notify you when we detect anomalies.
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-surface">
			<div className="border-b border-border px-5 py-3">
				<h2 className="text-sm font-semibold">Recent Alerts</h2>
			</div>
			<div className="divide-y divide-border">
				{alerts.map((alert) => {
					const Icon = ALERT_ICONS[alert.type];
					return (
						<div
							key={alert.id}
							className={`flex items-start gap-3 border-l-2 px-5 py-3 ${SEVERITY_COLORS[alert.severity]}`}
						>
							<Icon size={16} className="mt-0.5 shrink-0 text-muted" />
							<div>
								<p className="text-sm font-medium">{alert.title}</p>
								<p className="text-xs text-muted">{alert.description}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
```

- [ ] **Step 4: Wire up dashboard page**

Replace `app/dashboard/page.tsx` with:

```tsx
import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Fetch summary data
	const now = new Date();
	const weekFromNow = new Date(now);
	weekFromNow.setDate(weekFromNow.getDate() + 7);
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		.toISOString()
		.split("T")[0];

	const [dueThisWeekRes, overdueRes, monthlyRes, alertCountRes, billsRes, alertsRes] =
		await Promise.all([
			supabase
				.from("bills")
				.select("*", { count: "exact", head: true })
				.lte("due_date", weekFromNow.toISOString().split("T")[0])
				.gte("due_date", now.toISOString().split("T")[0])
				.in("status", ["upcoming", "due_soon"]),
			supabase
				.from("bills")
				.select("*", { count: "exact", head: true })
				.eq("status", "overdue"),
			supabase
				.from("bills")
				.select("amount")
				.gte("due_date", startOfMonth),
			supabase
				.from("alerts")
				.select("*", { count: "exact", head: true })
				.eq("is_dismissed", false)
				.eq("is_read", false),
			supabase
				.from("bills")
				.select("*, billers(name)")
				.in("status", ["upcoming", "due_soon", "overdue"])
				.order("due_date", { ascending: true })
				.limit(5),
			supabase
				.from("alerts")
				.select("*, billers(name)")
				.eq("is_dismissed", false)
				.order("created_at", { ascending: false })
				.limit(5),
		]);

	const monthlyTotal = (monthlyRes.data ?? []).reduce(
		(sum, b) => sum + Number(b.amount),
		0,
	);

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<div>
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<p className="text-sm text-muted">
					Welcome back, {user?.user_metadata?.full_name ?? user?.email}
				</p>
			</div>

			<SummaryCards
				data={{
					dueThisWeek: dueThisWeekRes.count ?? 0,
					overdue: overdueRes.count ?? 0,
					monthlyTotal,
					activeAlerts: alertCountRes.count ?? 0,
				}}
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<UpcomingBills bills={(billsRes.data as never[]) ?? []} />
				<RecentAlerts alerts={(alertsRes.data as never[]) ?? []} />
			</div>
		</div>
	);
}
```

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx components/dashboard/
git commit -m "feat: add dashboard home with summary cards, upcoming bills, and recent alerts"
```

---

### Task 6: Bills Page

**Files:**
- Create: `app/dashboard/bills/page.tsx`

- [ ] **Step 1: Create bills page**

Create `app/dashboard/bills/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function BillsPage() {
	const supabase = await createClient();

	const { data: bills } = await supabase
		.from("bills")
		.select("*, billers(name, category)")
		.order("due_date", { ascending: true });

	const allBills = bills ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Bills</h1>

			{allBills.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No bills found. Sync your email to detect bills automatically.
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border bg-surface">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-xs text-muted">
								<th className="px-5 py-3 font-medium">Biller</th>
								<th className="px-5 py-3 font-medium">Amount</th>
								<th className="px-5 py-3 font-medium">Due Date</th>
								<th className="px-5 py-3 font-medium">Status</th>
								<th className="px-5 py-3 font-medium">Source</th>
								<th className="px-5 py-3 font-medium">Confidence</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{allBills.map((bill) => (
								<tr key={bill.id} className="hover:bg-white/[0.02]">
									<td className="px-5 py-3 font-medium">
										{(bill as Record<string, unknown> & { billers: { name: string } }).billers?.name ?? "Unknown"}
									</td>
									<td className="px-5 py-3 font-mono">
										${Number(bill.amount).toFixed(2)}
									</td>
									<td className="px-5 py-3">{bill.due_date}</td>
									<td className="px-5 py-3">
										<span
											className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
												bill.status === "overdue"
													? "bg-urgent/10 text-urgent"
													: bill.status === "due_soon"
														? "bg-warning/10 text-warning"
														: bill.status === "paid"
															? "bg-success/10 text-success"
															: "bg-info/10 text-info"
											}`}
										>
											{bill.status}
										</span>
									</td>
									<td className="max-w-[200px] truncate px-5 py-3 text-muted">
										{bill.source_email_subject}
									</td>
									<td className="px-5 py-3 font-mono text-muted">
										{(Number(bill.confidence) * 100).toFixed(0)}%
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/bills/
git commit -m "feat: add bills page with sortable table and status badges"
```

---

### Task 7: Alerts Page

**Files:**
- Create: `app/dashboard/alerts/page.tsx`
- Create: `components/alerts/alert-actions.tsx`

- [ ] **Step 1: Create alert action buttons (client component)**

Create `components/alerts/alert-actions.tsx`:

```tsx
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
```

- [ ] **Step 2: Create alerts page**

Create `app/dashboard/alerts/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { AlertActions } from "@/components/alerts/alert-actions";

const ALERT_ICONS = {
	price_increase: TrendingUp,
	unexpected_charge: AlertTriangle,
	new_biller: Plus,
} as const;

const SEVERITY_COLORS = {
	urgent: "border-l-urgent",
	warning: "border-l-warning",
	info: "border-l-info",
} as const;

export default async function AlertsPage() {
	const supabase = await createClient();

	const { data: alerts } = await supabase
		.from("alerts")
		.select("*, billers(name)")
		.eq("is_dismissed", false)
		.order("created_at", { ascending: false });

	const allAlerts = alerts ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Alerts</h1>

			{allAlerts.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No alerts. We&apos;ll notify you when we detect anomalies.
				</div>
			) : (
				<div className="space-y-3">
					{allAlerts.map((alert) => {
						const Icon = ALERT_ICONS[alert.type as keyof typeof ALERT_ICONS] ?? AlertTriangle;
						return (
							<div
								key={alert.id}
								className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-surface border-l-2 px-5 py-4 ${SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] ?? ""} ${alert.is_read ? "opacity-60" : ""}`}
							>
								<div className="flex items-start gap-3">
									<Icon size={18} className="mt-0.5 shrink-0 text-muted" />
									<div>
										<p className="text-sm font-medium">{alert.title}</p>
										<p className="mt-1 text-xs text-muted">{alert.description}</p>
										<p className="mt-2 text-xs text-muted">
											{(alert as Record<string, unknown> & { billers: { name: string } }).billers?.name} &middot;{" "}
											{new Date(alert.created_at).toLocaleDateString()}
										</p>
									</div>
								</div>
								<AlertActions alertId={alert.id} isRead={alert.is_read} />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/alerts/ components/alerts/
git commit -m "feat: add alerts page with severity colors, dismiss, and mark-read actions"
```

---

### Task 8: Billers Page

**Files:**
- Create: `app/dashboard/billers/page.tsx`

- [ ] **Step 1: Create billers page**

Create `app/dashboard/billers/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, string> = {
	subscription: "Subscription",
	utility: "Utility",
	credit_card: "Credit Card",
	insurance: "Insurance",
	other: "Other",
};

export default async function BillersPage() {
	const supabase = await createClient();

	const { data: billers } = await supabase
		.from("billers")
		.select("*, bills(count)")
		.order("name", { ascending: true });

	const allBillers = billers ?? [];

	return (
		<div className="space-y-6 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Billers</h1>

			{allBillers.length === 0 ? (
				<div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted">
					No billers detected yet. Sync your email to discover billers.
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{allBillers.map((biller) => (
						<div
							key={biller.id}
							className="rounded-xl border border-border bg-surface p-5"
						>
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold">{biller.name}</h3>
								<span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
									{CATEGORY_LABELS[biller.category] ?? biller.category}
								</span>
							</div>
							<div className="mt-4 grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-muted">Typical Amount</p>
									<p className="mt-1 font-mono text-sm font-medium">
										{biller.typical_amount
											? `$${Number(biller.typical_amount).toFixed(2)}`
											: "—"}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted">Frequency</p>
									<p className="mt-1 text-sm capitalize">{biller.billing_frequency}</p>
								</div>
								<div>
									<p className="text-xs text-muted">Bills</p>
									<p className="mt-1 text-sm">
										{Array.isArray(biller.bills)
											? (biller.bills[0] as { count: number })?.count ?? 0
											: 0}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted">First Seen</p>
									<p className="mt-1 text-sm">
										{new Date(biller.first_seen_at).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/billers/
git commit -m "feat: add billers page with category badges and billing stats"
```

---

### Task 9: Settings Page

**Files:**
- Create: `app/dashboard/settings/page.tsx`
- Create: `components/settings/notification-form.tsx`

- [ ] **Step 1: Create notification settings form (client component)**

Create `components/settings/notification-form.tsx`:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { NotificationPreferences } from "@/lib/types";

export function NotificationForm({
	initial,
}: {
	initial: NotificationPreferences;
}) {
	const [prefs, setPrefs] = useState(initial);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		const supabase = createClient();
		await supabase
			.from("notification_preferences")
			.update({
				push_enabled: prefs.push_enabled,
				email_digest_enabled: prefs.email_digest_enabled,
				email_digest_frequency: prefs.email_digest_frequency,
				quiet_hours_start: prefs.quiet_hours_start,
				quiet_hours_end: prefs.quiet_hours_end,
				alert_price_increase: prefs.alert_price_increase,
				alert_unexpected_charge: prefs.alert_unexpected_charge,
				alert_new_biller: prefs.alert_new_biller,
				alert_due_reminder: prefs.alert_due_reminder,
				reminder_days_before: prefs.reminder_days_before,
			})
			.eq("id", prefs.id);
		setSaving(false);
	};

	const toggle = (key: keyof NotificationPreferences) => {
		setPrefs((p) => ({ ...p, [key]: !p[key] }));
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<h3 className="text-sm font-semibold">Notification Channels</h3>

				<label className="flex items-center justify-between">
					<span className="text-sm">Push notifications</span>
					<input
						type="checkbox"
						checked={prefs.push_enabled}
						onChange={() => toggle("push_enabled")}
						className="accent-accent"
					/>
				</label>

				<label className="flex items-center justify-between">
					<span className="text-sm">Email digest</span>
					<input
						type="checkbox"
						checked={prefs.email_digest_enabled}
						onChange={() => toggle("email_digest_enabled")}
						className="accent-accent"
					/>
				</label>

				{prefs.email_digest_enabled && (
					<label className="flex items-center justify-between">
						<span className="text-sm text-muted">Digest frequency</span>
						<select
							value={prefs.email_digest_frequency}
							onChange={(e) =>
								setPrefs((p) => ({
									...p,
									email_digest_frequency: e.target.value as "daily" | "weekly",
								}))
							}
							className="rounded bg-background border border-border px-2 py-1 text-sm"
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
						</select>
					</label>
				)}
			</div>

			<div className="rounded-xl border border-border bg-surface p-5 space-y-4">
				<h3 className="text-sm font-semibold">Alert Types</h3>
				<label className="flex items-center justify-between">
					<span className="text-sm">Price increases</span>
					<input
						type="checkbox"
						checked={prefs.alert_price_increase}
						onChange={() => toggle("alert_price_increase")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">Unexpected charges</span>
					<input
						type="checkbox"
						checked={prefs.alert_unexpected_charge}
						onChange={() => toggle("alert_unexpected_charge")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">New billers</span>
					<input
						type="checkbox"
						checked={prefs.alert_new_biller}
						onChange={() => toggle("alert_new_biller")}
						className="accent-accent"
					/>
				</label>
				<label className="flex items-center justify-between">
					<span className="text-sm">Due date reminders</span>
					<input
						type="checkbox"
						checked={prefs.alert_due_reminder}
						onChange={() => toggle("alert_due_reminder")}
						className="accent-accent"
					/>
				</label>
				{prefs.alert_due_reminder && (
					<label className="flex items-center justify-between">
						<span className="text-sm text-muted">Remind days before</span>
						<input
							type="number"
							min={1}
							max={14}
							value={prefs.reminder_days_before}
							onChange={(e) =>
								setPrefs((p) => ({
									...p,
									reminder_days_before: Number(e.target.value),
								}))
							}
							className="w-16 rounded bg-background border border-border px-2 py-1 text-sm font-mono text-center"
						/>
					</label>
				)}
			</div>

			<button
				type="button"
				onClick={handleSave}
				disabled={saving}
				className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
			>
				{saving ? "Saving..." : "Save Preferences"}
			</button>
		</div>
	);
}
```

- [ ] **Step 2: Create settings page**

Create `app/dashboard/settings/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { NotificationForm } from "@/components/settings/notification-form";
import type { NotificationPreferences } from "@/lib/types";

export default async function SettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: prefs } = await supabase
		.from("notification_preferences")
		.select("*")
		.eq("user_id", user!.id)
		.single();

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("email_address, sync_status, last_synced_at")
		.eq("user_id", user!.id);

	return (
		<div className="space-y-8 p-6 lg:p-8">
			<h1 className="text-2xl font-bold">Settings</h1>

			{/* Connected Accounts */}
			<div>
				<h2 className="mb-4 text-lg font-semibold">Connected Accounts</h2>
				<div className="space-y-3">
					{(accounts ?? []).map((account) => (
						<div
							key={account.email_address}
							className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
						>
							<div>
								<p className="text-sm font-medium">{account.email_address}</p>
								<p className="text-xs text-muted">
									Last synced:{" "}
									{account.last_synced_at
										? new Date(account.last_synced_at).toLocaleString()
										: "Never"}
								</p>
							</div>
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-medium ${
									account.sync_status === "active"
										? "bg-success/10 text-success"
										: account.sync_status === "error"
											? "bg-urgent/10 text-urgent"
											: "bg-muted/10 text-muted"
								}`}
							>
								{account.sync_status}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Notification Preferences */}
			<div>
				<h2 className="mb-4 text-lg font-semibold">Notifications</h2>
				{prefs ? (
					<NotificationForm initial={prefs as NotificationPreferences} />
				) : (
					<p className="text-sm text-muted">
						Notification preferences not found.
					</p>
				)}
			</div>
		</div>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/settings/ components/settings/
git commit -m "feat: add settings page with notification preferences and connected accounts"
```

---

### Task 10: Build Verification

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Expected: Build succeeds with no errors. Fix any type errors before proceeding.

- [ ] **Step 2: Run dev and visually verify all pages**

```bash
pnpm dev
```

Check each route:
1. `/` — Landing page with hero, features, privacy, CTA
2. `/login` — Login page with Google button and privacy note
3. `/dashboard` — Summary cards + upcoming bills + recent alerts (empty states OK)
4. `/dashboard/bills` — Table (empty state OK)
5. `/dashboard/alerts` — Alert feed (empty state OK)
6. `/dashboard/billers` — Biller cards (empty state OK)
7. `/dashboard/settings` — Connected accounts + notification prefs form

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build/UI issues from phase 3 verification"
```

(Skip if no fixes needed.)
