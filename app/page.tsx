"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
	Shield,
	Zap,
	Bell,
	TrendingUp,
	AlertTriangle,
	Plus,
	Mail,
	DollarSign,
	Lock,
	Users,
	CheckCircle,
	ArrowRight,
	Play,
	LogIn,
	Calendar,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCountry } from "@/components/country-provider";
import { CountryToggle } from "@/components/country-toggle";
import {
	fadeInUp,
	staggerContainer,
	staggerItem,
	slideInRight,
	hoverLift,
	sectionReveal,
	sectionRevealStagger,
} from "@/lib/animations";

function AnimatedCounter({
	value,
	prefix = "",
	suffix = "",
}: {
	value: number;
	prefix?: string;
	suffix?: string;
}) {
	const [count, setCount] = useState(0);
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true });

	useEffect(() => {
		if (!inView) return;
		let start = 0;
		const duration = 1500;
		const startTime = performance.now();
		function step(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			start = Math.floor(eased * value);
			setCount(start);
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}, [inView, value]);

	return (
		<span ref={ref}>
			{prefix}
			{count.toLocaleString()}
			{suffix}
		</span>
	);
}

export default function LandingPage() {
	const { country, formatCurrency } = useCountry();

	const content = {
		US: {
			demonym: "American",
			lostPerYear: 512,
			mockCards: [
				{ label: "Due This Week", value: "$847", tag: "3 bills", tagColor: "bg-warning-light text-warning" },
				{ label: "Overdue", value: "$129", tagColor: "bg-urgent-light text-urgent", tag: "1 bill", valueColor: "text-urgent" },
				{ label: "Monthly Total", value: "$2,341", tag: "-3%", tagColor: "bg-success-light text-success" },
				{ label: "Alerts", value: "3", tag: "1 urgent", tagColor: "bg-urgent-light text-urgent" },
			],
			mockBills: [
				{ name: "Chase Sapphire", due: "Due Mar 29", amount: "$542.32", urgency: "Due in 2 days", urgClass: "text-urgent" },
				{ name: "Con Edison", due: "Due Apr 1", amount: "$176.00", urgency: "Due in 5 days", urgClass: "text-warning" },
				{ name: "Netflix", due: "Due Apr 5", amount: "$22.99", urgency: "Due in 9 days", urgClass: "text-muted" },
			],
			mockAlerts: [
				{ type: "Price Increase", desc: "Netflix: $15.49 \u2192 $22.99 (+48%)", time: "2h ago", color: "bg-urgent", typeColor: "text-urgent" },
				{ type: "Unexpected Charge", desc: "Late fee $35.00 from Chase", time: "1d ago", color: "bg-warning", typeColor: "text-warning" },
				{ type: "New Biller", desc: "First charge: Cursor Pro \u2014 $20.00", time: "3d ago", color: "bg-accent", typeColor: "text-info" },
			],
			statFee: "$512",
			statLabel: "avg. lost per year to overlooked fees",
			alertMockup: {
				priceIncrease: 'Netflix subscription increased from $15.49 to $22.99 (+48.3%). This is the second increase in 12 months.',
				priceIncreaseMeta: "Effective next billing cycle \u00b7 +$90/year impact",
				lateFee: "Chase Sapphire charged a $35.00 late fee. Your minimum payment of $142.00 was due 3 days ago.",
				lateFeeMeta: "Chase Sapphire Preferred",
				newBiller: "First charge detected from Cursor Pro for $20.00. Added to your biller list automatically.",
			},
		},
		IN: {
			demonym: "Indian",
			lostPerYear: 42000,
			mockCards: [
				{ label: "Due This Week", value: "\u20b970,200", tag: "3 bills", tagColor: "bg-warning-light text-warning" },
				{ label: "Overdue", value: "\u20b910,700", tagColor: "bg-urgent-light text-urgent", tag: "1 bill", valueColor: "text-urgent" },
				{ label: "Monthly Total", value: "\u20b91,94,200", tag: "-3%", tagColor: "bg-success-light text-success" },
				{ label: "Alerts", value: "3", tag: "1 urgent", tagColor: "bg-urgent-light text-urgent" },
			],
			mockBills: [
				{ name: "HDFC Credit Card", due: "Due Mar 29", amount: "\u20b945,000", urgency: "Due in 2 days", urgClass: "text-urgent" },
				{ name: "Tata Power", due: "Due Apr 1", amount: "\u20b93,200", urgency: "Due in 5 days", urgClass: "text-warning" },
				{ name: "Hotstar", due: "Due Apr 5", amount: "\u20b9299", urgency: "Due in 9 days", urgClass: "text-muted" },
			],
			mockAlerts: [
				{ type: "Price Increase", desc: "Hotstar: \u20b9199 \u2192 \u20b9299 (+50%)", time: "2h ago", color: "bg-urgent", typeColor: "text-urgent" },
				{ type: "Unexpected Charge", desc: "Late fee \u20b92,900 from HDFC", time: "1d ago", color: "bg-warning", typeColor: "text-warning" },
				{ type: "New Biller", desc: "First charge: Cursor Pro \u2014 \u20b91,660", time: "3d ago", color: "bg-accent", typeColor: "text-info" },
			],
			statFee: "\u20b942,000",
			statLabel: "avg. lost per year to overlooked fees",
			alertMockup: {
				priceIncrease: 'Hotstar subscription increased from \u20b9199 to \u20b9299 (+50%). This is the second increase in 12 months.',
				priceIncreaseMeta: "Effective next billing cycle \u00b7 +\u20b91,200/year impact",
				lateFee: "HDFC Credit Card charged a \u20b92,900 late fee. Your minimum payment of \u20b911,800 was due 3 days ago.",
				lateFeeMeta: "HDFC Credit Card",
				newBiller: "First charge detected from Cursor Pro for \u20b91,660. Added to your biller list automatically.",
			},
		},
	};
	const c = content[country];

	// Parallax for dashboard preview
	const dashboardRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: dashboardRef,
		offset: ["start end", "end start"],
	});
	const dashboardY = useTransform(scrollYProgress, [0, 1], [40, -40]);

	return (
		<div className="flex flex-col">
			{/* Nav */}
			<motion.nav
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
			>
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
					<div className="flex items-center gap-2.5 text-lg font-bold">
						<DollarSign size={22} className="text-accent" />
						PayWatch
					</div>
					<div className="hidden items-center gap-8 md:flex">
						<a href="#problem" className="text-sm text-muted transition-colors hover:text-foreground">Why PayWatch</a>
						<a href="#how" className="text-sm text-muted transition-colors hover:text-foreground">How it works</a>
						<a href="#features" className="text-sm text-muted transition-colors hover:text-foreground">Features</a>
						<CountryToggle />
						<ThemeToggle />
						<Link href="/login" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
							Get Started
						</Link>
					</div>
					<div className="flex items-center gap-2 md:hidden">
						<CountryToggle />
						<ThemeToggle />
					</div>
				</div>
			</motion.nav>

			{/* Hero */}
			<section className="relative overflow-hidden px-6 pb-20 pt-24 text-center lg:pt-32">
				<div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08)_0%,rgba(37,99,235,0.03)_40%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.15)_0%,rgba(94,106,210,0.05)_40%,transparent_70%)]" />
				<motion.div
					initial="hidden"
					animate="visible"
					variants={staggerContainer}
					className="relative z-10 mx-auto max-w-3xl"
				>
					{/* Stat badge */}
					<motion.div
						variants={fadeInUp}
						className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-urgent/20 bg-urgent/10 px-5 py-2 text-sm font-semibold text-urgent"
					>
						<AlertTriangle size={16} />
						The average {c.demonym} loses {c.statFee}/year to hidden fees
					</motion.div>

					<motion.h1
						variants={fadeInUp}
						className="text-5xl font-black tracking-tighter lg:text-7xl"
						style={{ lineHeight: 1.05 }}
					>
						<span>Your bills are<br />quietly </span>
						<span className="bg-gradient-to-r from-[#7B85E0] via-accent to-[#A855F7] bg-clip-text text-transparent">
							bleeding money
						</span>
					</motion.h1>
					<motion.p
						variants={fadeInUp}
						className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted lg:text-xl"
					>
						PayWatch scans your email for every bill, subscription, and payment — then alerts you to price hikes, hidden fees, and charges you didn&apos;t expect.
					</motion.p>
					<motion.div
						variants={fadeInUp}
						className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
					>
						<Link
							href="/login"
							className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-9 py-4 text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
						>
							<LogIn size={20} />
							Start Watching for Free
						</Link>
						<a
							href="#how"
							className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-4 text-base font-medium text-muted transition-all hover:text-foreground"
						>
							<Play size={18} />
							See how it works
						</a>
					</motion.div>
					<motion.div
						variants={fadeInUp}
						className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[13px] text-muted"
					>
						<span className="flex items-center gap-1.5"><Shield size={14} className="text-success" /> Read-only email access</span>
						<span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-success" /> No credit card required</span>
						<span className="flex items-center gap-1.5"><Lock size={14} className="text-success" /> Your data stays private</span>
					</motion.div>
				</motion.div>
			</section>

			{/* Dashboard Preview */}
			<motion.section
				ref={dashboardRef}
				{...sectionReveal}
				className="relative mx-auto max-w-5xl px-6 pb-24"
			>
				<div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 w-4/5 h-[200px] bg-[radial-gradient(ellipse,rgba(37,99,235,0.10)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(94,106,210,0.20)_0%,transparent_70%)] blur-[40px]" />
				<motion.div
					style={{ y: dashboardY }}
					className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xl dark:shadow-[0_32px_100px_rgba(0,0,0,0.5)]"
				>
					{/* Browser bar */}
					<div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-3">
						<div className="h-2.5 w-2.5 rounded-full bg-urgent" />
						<div className="h-2.5 w-2.5 rounded-full bg-warning" />
						<div className="h-2.5 w-2.5 rounded-full bg-success" />
						<span className="ml-3 font-mono text-xs text-muted">paywatch.sh-himanshu.com/dashboard</span>
					</div>
					{/* Dashboard mockup */}
					<div className="flex min-h-[380px]">
						{/* Sidebar */}
						<div className="hidden w-[200px] shrink-0 border-r border-border bg-surface-secondary p-5 sm:block">
							{[
								{ label: "Dashboard", active: true },
								{ label: "Bills", active: false },
								{ label: "Alerts", active: false },
								{ label: "Billers", active: false },
								{ label: "Settings", active: false },
							].map((item) => (
								<div key={item.label} className={`mb-0.5 rounded-md px-3 py-2.5 text-[13px] ${item.active ? "bg-accent-light text-accent" : "text-muted"}`}>
									{item.label}
								</div>
							))}
						</div>
						{/* Main */}
						<div className="flex-1 p-6">
							<div className="mb-5 flex items-center justify-between">
								<div>
									<div className="text-lg font-semibold">Dashboard</div>
									<div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
										<span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Last synced 5 min ago
									</div>
								</div>
								<div className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-[11px] text-muted">Scan Now</div>
							</div>
							{/* Cards */}
							<div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
								{c.mockCards.map((card) => (
									<div key={card.label} className="rounded-lg border border-border bg-surface-secondary p-3.5">
										<div className="text-[9px] font-medium uppercase tracking-wide text-muted">{card.label}</div>
										<div className={`mt-1 font-mono text-xl font-medium ${card.valueColor ?? ""}`}>{card.value}</div>
										<span className={`mt-1 inline-block rounded px-1.5 py-px text-[9px] font-medium ${card.tagColor}`}>{card.tag}</span>
									</div>
								))}
							</div>
							{/* Panels */}
							<div className="grid gap-3 lg:grid-cols-2">
								<div className="overflow-hidden rounded-lg border border-border bg-surface">
									<div className="border-b border-border px-3.5 py-2.5 text-xs font-semibold">Upcoming Bills</div>
									{c.mockBills.map((row) => (
										<div key={row.name} className="flex items-center justify-between border-b border-border px-3.5 py-2.5 last:border-b-0">
											<div>
												<div className="text-xs font-medium">{row.name}</div>
												<div className="text-[10px] text-muted">{row.due}</div>
											</div>
											<div className="text-right">
												<div className="font-mono text-xs font-medium">{row.amount}</div>
												<div className={`text-[9px] font-medium ${row.urgClass}`}>{row.urgency}</div>
											</div>
										</div>
									))}
								</div>
								<div className="overflow-hidden rounded-lg border border-border bg-surface">
									<div className="border-b border-border px-3.5 py-2.5 text-xs font-semibold">Recent Alerts</div>
									{c.mockAlerts.map((alert) => (
										<div key={alert.type} className="relative border-b border-border py-2.5 pl-5 pr-3.5 last:border-b-0">
											<div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded ${alert.color}`} />
											<div className="flex items-center justify-between">
												<span className={`text-[11px] font-semibold ${alert.typeColor}`}>{alert.type}</span>
												<span className="text-[9px] text-muted">{alert.time}</span>
											</div>
											<div className="mt-0.5 text-[10px] text-muted">{alert.desc}</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.section>

			{/* Problem Section */}
			<motion.section
				id="problem"
				{...sectionRevealStagger}
				className="relative overflow-hidden border-t border-border px-6 py-28 lg:py-36"
			>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-urgent/[0.03] to-transparent" />
				<div className="relative mx-auto max-w-6xl">
					<motion.span
						variants={staggerItem}
						className="inline-flex items-center gap-2 rounded-full border border-urgent/15 bg-urgent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-urgent"
					>
						<AlertTriangle size={14} /> The Problem
					</motion.span>
					<motion.h2
						variants={staggerItem}
						className="mt-5 text-4xl font-extrabold tracking-tight lg:text-5xl"
						style={{ lineHeight: 1.1 }}
					>
						You&apos;re paying more<br />than you realize
					</motion.h2>
					<motion.p variants={staggerItem} className="mt-4 max-w-xl text-lg text-muted">
						Between subscriptions creeping up, late fees you missed, and charges from services you forgot about — your inbox holds the clues, but nobody&apos;s looking.
					</motion.p>
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-14 grid gap-5 lg:grid-cols-3"
					>
						{[
							{
								icon: TrendingUp,
								iconColor: "text-urgent bg-urgent/10",
								title: "Silent Price Increases",
								desc: "Streaming, SaaS, and subscription services raise prices quietly. A small email. A line in the fine print. Most people never notice.",
								statValue: 73,
								statPrefix: "",
								statSuffix: "%",
								statLabel: "of users don't notice subscription price hikes",
							},
							{
								icon: DollarSign,
								iconColor: "text-warning bg-warning/10",
								title: "Hidden Fees That Add Up",
								desc: "Late fees, service charges, convenience fees, foreign transaction fees — small amounts that compound into real money over months.",
								statValue: c.lostPerYear,
								statPrefix: country === "US" ? "$" : "\u20b9",
								statSuffix: "",
								statLabel: c.statLabel,
							},
							{
								icon: Mail,
								iconColor: "text-new bg-new/10",
								title: "Buried in Your Inbox",
								desc: "Payment confirmations, statements, and bill reminders all live in your email — scattered across promotions, updates, and spam.",
								statValue: 47,
								statPrefix: "",
								statSuffix: "",
								statLabel: "avg. payment-related emails per month",
							},
						].map((card) => {
							const Icon = card.icon;
							return (
								<motion.div
									key={card.title}
									variants={staggerItem}
									{...hoverLift}
									className="rounded-xl border border-border bg-surface p-8 transition-colors hover:border-accent/20"
								>
									<div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconColor}`}>
										<Icon size={20} />
									</div>
									<h3 className="mt-5 text-base font-semibold">{card.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted">{card.desc}</p>
									<div className="mt-6 border-t border-border pt-5">
										<span className="font-mono text-3xl font-bold">
											<AnimatedCounter
												value={card.statValue}
												prefix={card.statPrefix}
												suffix={card.statSuffix}
											/>
										</span>
										<span className="ml-2 text-xs text-muted">{card.statLabel}</span>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</motion.section>

			{/* How It Works */}
			<motion.section
				id="how"
				{...sectionRevealStagger}
				className="border-t border-border px-6 py-28 lg:py-36"
			>
				<div className="mx-auto max-w-6xl">
					<motion.div className="text-center">
						<motion.span
							variants={staggerItem}
							className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent"
						>
							<Zap size={14} /> How It Works
						</motion.span>
						<motion.h2
							variants={staggerItem}
							className="mt-5 text-4xl font-extrabold tracking-tight lg:text-5xl"
						>
							Three steps. Zero effort.
						</motion.h2>
						<motion.p variants={staggerItem} className="mx-auto mt-4 max-w-xl text-lg text-muted">
							Connect your Gmail, and PayWatch does the rest. No manual data entry. No spreadsheets. No forgetting.
						</motion.p>
					</motion.div>

					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-80px" }}
						className="relative mt-20"
					>
						{/* Horizontal connector line (desktop only) */}
						<div className="pointer-events-none absolute top-[2.75rem] left-0 right-0 hidden lg:block">
							<motion.div
								variants={{
									hidden: { scaleX: 0 },
									visible: {
										scaleX: 1,
										transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
									},
								}}
								className="mx-auto h-[2px] origin-left bg-gradient-to-r from-accent/5 via-accent/40 to-accent/5"
								style={{ width: "calc(100% - 12rem)", marginLeft: "6rem" }}
							/>
						</div>

						<div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
							{[
								{
									num: "1",
									icon: LogIn,
									title: "Connect Gmail",
									desc: "Sign in with Google. We request read-only access to scan payment-related emails only.",
								},
								{
									num: "2",
									icon: CheckCircle,
									title: "Auto-Detect Everything",
									desc: "AI parses bills, statements, and receipts. Identifies amounts, due dates, billers, and irregularities.",
								},
								{
									num: "3",
									icon: Bell,
									title: "Get Notified Instantly",
									desc: "Price hikes, hidden fees, upcoming deadlines — alerts reach you via push, email, or your dashboard.",
								},
							].map((step, i) => {
								const Icon = step.icon;
								return (
									<motion.div
										key={step.num}
										variants={{
											hidden: { opacity: 0, y: 30 },
											visible: {
												opacity: 1,
												y: 0,
												transition: {
													duration: 0.5,
													ease: [0.22, 1, 0.36, 1],
													delay: i * 0.2,
												},
											},
										}}
										className="flex flex-col items-center text-center"
									>
										{/* Step circle with pulse ring */}
										<div className="relative">
											<motion.div
												variants={{
													hidden: { scale: 0, opacity: 0 },
													visible: {
														scale: 1,
														opacity: 1,
														transition: {
															type: "spring",
															stiffness: 260,
															damping: 20,
															delay: 0.3 + i * 0.2,
														},
													},
												}}
												className="step-circle-ring relative z-10 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border-2 border-accent/20 bg-surface shadow-lg shadow-accent/5"
											>
												<div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
													<Icon size={24} />
												</div>
											</motion.div>
											{/* Pulse animation ring */}
											<motion.div
												variants={{
													hidden: { scale: 0.8, opacity: 0 },
													visible: {
														scale: 1,
														opacity: 1,
														transition: { delay: 0.6 + i * 0.2, duration: 0.4 },
													},
												}}
												className="step-pulse-ring absolute inset-0 rounded-full border border-accent/15"
											/>
										</div>

										{/* Step number */}
										<motion.span
											variants={{
												hidden: { opacity: 0 },
												visible: {
													opacity: 1,
													transition: { delay: 0.5 + i * 0.2 },
												},
											}}
											className="mt-5 font-mono text-xs font-semibold uppercase tracking-widest text-accent"
										>
											Step {step.num}
										</motion.span>

										{/* Content */}
										<h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
										<p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{step.desc}</p>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Smart Alerts Section */}
			<motion.section
				{...sectionRevealStagger}
				className="border-t border-border px-6 py-28 lg:py-36"
			>
				<div className="mx-auto max-w-6xl">
					<div className="grid items-start gap-16 lg:grid-cols-2">
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: "-80px" }}
						>
							<motion.span
								variants={staggerItem}
								className="inline-flex items-center gap-2 rounded-full border border-warning/15 bg-warning/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-warning"
							>
								<Bell size={14} /> Smart Alerts
							</motion.span>
							<motion.h2 variants={staggerItem} className="mt-5 text-4xl font-extrabold tracking-tight">
								Catches what you&apos;d miss
							</motion.h2>
							<motion.p variants={staggerItem} className="mt-4 text-lg text-muted">
								PayWatch continuously monitors for three types of financial anomalies that cost you the most.
							</motion.p>
							<motion.div
								variants={staggerContainer}
								className="mt-10 space-y-6"
							>
								{[
									{ icon: TrendingUp, color: "text-urgent bg-urgent/10", title: "Price Increases", desc: "Detects when a recurring bill amount changes and shows the exact increase with history." },
									{ icon: AlertTriangle, color: "text-warning bg-warning/10", title: "Unexpected Charges", desc: "Flags late fees, service charges, and amounts that deviate from your normal billing patterns." },
									{ icon: Plus, color: "text-info bg-info/10", title: "New Unknown Billers", desc: "Alerts you when a charge appears from a company you've never been billed by before." },
								].map((item) => {
									const Icon = item.icon;
									return (
										<motion.div key={item.title} variants={staggerItem} className="flex items-start gap-4">
											<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
												<Icon size={18} />
											</div>
											<div>
												<h4 className="text-sm font-semibold">{item.title}</h4>
												<p className="mt-1 text-sm text-muted">{item.desc}</p>
											</div>
										</motion.div>
									);
								})}
							</motion.div>
						</motion.div>
						{/* Alerts mockup */}
						<motion.div
							variants={slideInRight}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: "-80px" }}
							className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
						>
							<div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-3">
								<div className="h-2.5 w-2.5 rounded-full bg-urgent" />
								<div className="h-2.5 w-2.5 rounded-full bg-warning" />
								<div className="h-2.5 w-2.5 rounded-full bg-success" />
								<span className="ml-3 font-mono text-xs text-muted">paywatch.app/alerts</span>
							</div>
							<div className="p-5">
								<div className="mb-4 text-sm font-semibold">Active Alerts</div>
								<div className="space-y-3">
									{[
										{
											type: "Price Increase Detected",
											typeColor: "text-urgent",
											bar: "bg-urgent",
											time: "2 hours ago",
											desc: c.alertMockup.priceIncrease,
											meta: c.alertMockup.priceIncreaseMeta,
										},
										{
											type: "Unexpected Late Fee",
											typeColor: "text-warning",
											bar: "bg-warning",
											time: "1 day ago",
											desc: c.alertMockup.lateFee,
											meta: c.alertMockup.lateFeeMeta,
										},
										{
											type: "New Biller Detected",
											typeColor: "text-info",
											bar: "bg-accent",
											time: "3 days ago",
											desc: c.alertMockup.newBiller,
											meta: "Auto-tracked",
										},
									].map((alert) => (
										<div key={alert.type} className="relative rounded-lg border border-border bg-surface-secondary py-4 pl-5 pr-4">
											<div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l ${alert.bar}`} />
											<div className="flex items-center justify-between">
												<span className={`text-xs font-semibold ${alert.typeColor}`}>{alert.type}</span>
												<span className="text-[10px] text-muted">{alert.time}</span>
											</div>
											<p className="mt-1.5 text-xs leading-relaxed text-muted">{alert.desc}</p>
											<p className="mt-2 text-[10px] text-muted">{alert.meta}</p>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* Features Grid */}
			<motion.section
				id="features"
				{...sectionRevealStagger}
				className="border-t border-border px-6 py-28 lg:py-36"
			>
				<div className="mx-auto max-w-6xl">
					<motion.span
						variants={staggerItem}
						className="inline-flex items-center gap-2 rounded-full border border-success/15 bg-success/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-success"
					>
						<Zap size={14} /> Features
					</motion.span>
					<motion.h2 variants={staggerItem} className="mt-5 text-4xl font-extrabold tracking-tight">
						Built for people who value their money
					</motion.h2>
					<motion.p variants={staggerItem} className="mt-4 text-lg text-muted">
						Everything runs automatically. You just sign in and start saving.
					</motion.p>
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
					>
						{[
							{ icon: Mail, color: "text-info bg-info/10", title: "Gmail Auto-Scan", desc: "Automatically scans your inbox every 15 minutes for bills, statements, and payment receipts." },
							{ icon: CheckCircle, color: "text-accent bg-accent/10", title: "AI + Rules Engine", desc: "Known billers are parsed instantly with rules. New and complex formats fall back to AI extraction." },
							{ icon: TrendingUp, color: "text-urgent bg-urgent/10", title: "Anomaly Detection", desc: "Compares every bill against your history to catch price increases, new fees, and unusual amounts." },
							{ icon: Bell, color: "text-success bg-success/10", title: "Multi-Channel Alerts", desc: "Push notifications for urgent items, daily email digests of upcoming bills, plus a real-time dashboard." },
							{ icon: Calendar, color: "text-warning bg-warning/10", title: "Bill Calendar", desc: "See every upcoming payment on a timeline. Know exactly what's due this week, this month, and beyond." },
							{ icon: Shield, color: "text-new bg-new/10", title: "Privacy First", desc: "Read-only email access. Tokens encrypted at rest. Your financial data never leaves your account." },
						].map((feature) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={feature.title}
									variants={staggerItem}
									{...hoverLift}
									className="rounded-xl border border-border bg-surface p-7 transition-colors hover:border-accent/20"
								>
									<div className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}>
										<Icon size={20} />
									</div>
									<h3 className="mt-5 text-sm font-semibold">{feature.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted">{feature.desc}</p>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</motion.section>

			{/* Trust / Privacy */}
			<motion.section
				{...sectionRevealStagger}
				className="border-t border-border px-6 py-28"
			>
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						variants={staggerItem}
						className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent"
					>
						<Shield size={28} />
					</motion.div>
					<motion.h2
						variants={staggerItem}
						className="mt-6 text-3xl font-extrabold tracking-tight lg:text-4xl"
					>
						Your privacy is non-negotiable
					</motion.h2>
					<motion.p variants={staggerItem} className="mx-auto mt-4 max-w-xl text-lg text-muted">
						PayWatch is designed with security at every layer. We never have more access than we need.
					</motion.p>
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-12 grid gap-6 sm:grid-cols-3"
					>
						{[
							{ icon: Lock, title: "Read-Only Access", desc: "We never send, modify, or delete your emails. Gmail scopes are restricted to read-only." },
							{ icon: Shield, title: "Encrypted Tokens", desc: "OAuth tokens are encrypted at rest in Supabase with row-level security enforced." },
							{ icon: Users, title: "Your Data, Your Control", desc: "Delete your account and all associated data at any time. No data retention after deletion." },
						].map((point) => {
							const Icon = point.icon;
							return (
								<motion.div
									key={point.title}
									variants={staggerItem}
									{...hoverLift}
									className="rounded-xl border border-border bg-surface p-6"
								>
									<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
										<Icon size={20} />
									</div>
									<h4 className="mt-4 text-sm font-semibold">{point.title}</h4>
									<p className="mt-2 text-sm text-muted">{point.desc}</p>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</motion.section>

			{/* Final CTA */}
			<motion.section
				{...sectionReveal}
				className="border-t border-border px-6 py-24 text-center lg:py-32"
			>
				<h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
					Stop losing money<br />to your inbox
				</h2>
				<p className="mx-auto mt-4 max-w-md text-lg text-muted">
					Join PayWatch and let AI watch your bills so you don&apos;t have to. Free to start. Takes 30 seconds.
				</p>
				<Link
					href="/login"
					className="mt-10 inline-flex items-center gap-2.5 rounded-xl bg-accent px-9 py-4 text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
				>
					<ArrowRight size={20} />
					Get Started Free
				</Link>
				<div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted">
					<CheckCircle size={14} className="text-success" />
					No credit card required. Unsubscribe anytime.
				</div>
			</motion.section>

			{/* Footer */}
			<footer className="border-t border-border px-6 py-8">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
					<div className="text-xs text-muted">Built by Himan. Powered by Next.js, Supabase, and AI.</div>
					<div className="flex gap-6 text-xs text-muted">
						<a href="#" className="hover:text-foreground">Privacy</a>
						<a href="#" className="hover:text-foreground">Terms</a>
						<a href="#" className="hover:text-foreground">GitHub</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
