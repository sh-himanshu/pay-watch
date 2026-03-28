import Link from "next/link";
import {
	Shield,
	Zap,
	Bell,
	Eye,
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

export default function LandingPage() {
	return (
		<div className="flex flex-col">
			{/* Nav */}
			<nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
					<div className="flex items-center gap-2.5 text-lg font-bold">
						<DollarSign size={22} className="text-accent" />
						PayWatch
					</div>
					<div className="hidden items-center gap-8 md:flex">
						<a href="#problem" className="text-sm text-muted transition-colors hover:text-foreground">Why PayWatch</a>
						<a href="#how" className="text-sm text-muted transition-colors hover:text-foreground">How it works</a>
						<a href="#features" className="text-sm text-muted transition-colors hover:text-foreground">Features</a>
						<Link href="/login" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="relative overflow-hidden px-6 pb-20 pt-24 text-center lg:pt-32">
				<div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.15)_0%,rgba(94,106,210,0.05)_40%,transparent_70%)]" />
				<div className="relative z-10 mx-auto max-w-3xl">
					{/* Stat badge */}
					<div className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-urgent/20 bg-urgent/10 px-5 py-2 text-sm font-semibold text-urgent">
						<AlertTriangle size={16} />
						The average American loses $512/year to hidden fees
					</div>

					<h1 className="text-5xl font-black tracking-tighter lg:text-7xl" style={{ lineHeight: 1.05 }}>
						<span>Your bills are<br />quietly </span>
						<span className="bg-gradient-to-r from-[#7B85E0] via-accent to-[#A855F7] bg-clip-text text-transparent">
							bleeding money
						</span>
					</h1>
					<p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted lg:text-xl">
						PayWatch scans your email for every bill, subscription, and payment — then alerts you to price hikes, hidden fees, and charges you didn&apos;t expect.
					</p>
					<div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							href="/login"
							className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-9 py-4 text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
						>
							<LogIn size={20} />
							Start Watching for Free
						</Link>
						<a
							href="#how"
							className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-4 text-base font-medium text-muted transition-all hover:border-white/15 hover:text-foreground"
						>
							<Play size={18} />
							See how it works
						</a>
					</div>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#5A5E66]">
						<span className="flex items-center gap-1.5"><Shield size={14} className="text-success" /> Read-only email access</span>
						<span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-success" /> No credit card required</span>
						<span className="flex items-center gap-1.5"><Lock size={14} className="text-success" /> Your data stays private</span>
					</div>
				</div>
			</section>

			{/* Dashboard Preview */}
			<section className="relative mx-auto max-w-5xl px-6 pb-24">
				<div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 w-4/5 h-[200px] bg-[radial-gradient(ellipse,rgba(94,106,210,0.20)_0%,transparent_70%)] blur-[40px]" />
				<div className="relative overflow-hidden rounded-2xl border border-border bg-[#141419] shadow-[0_32px_100px_rgba(0,0,0,0.5)]">
					{/* Browser bar */}
					<div className="flex items-center gap-2 border-b border-border bg-white/[0.02] px-4 py-3">
						<div className="h-2.5 w-2.5 rounded-full bg-urgent" />
						<div className="h-2.5 w-2.5 rounded-full bg-warning" />
						<div className="h-2.5 w-2.5 rounded-full bg-success" />
						<span className="ml-3 font-mono text-xs text-muted">paywatch.app/dashboard</span>
					</div>
					{/* Dashboard mockup */}
					<div className="flex min-h-[380px]">
						{/* Sidebar */}
						<div className="hidden w-[200px] shrink-0 border-r border-border bg-white/[0.02] p-5 sm:block">
							{[
								{ label: "Dashboard", active: true },
								{ label: "Bills", active: false },
								{ label: "Alerts", active: false },
								{ label: "Billers", active: false },
								{ label: "Settings", active: false },
							].map((item) => (
								<div key={item.label} className={`mb-0.5 rounded-md px-3 py-2.5 text-[13px] ${item.active ? "bg-accent/10 text-accent" : "text-muted"}`}>
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
								<div className="rounded-md border border-border bg-white/[0.04] px-3 py-1.5 text-[11px] text-muted">Scan Now</div>
							</div>
							{/* Cards */}
							<div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
								{[
									{ label: "Due This Week", value: "$847", tag: "3 bills", tagColor: "bg-warning/10 text-warning" },
									{ label: "Overdue", value: "$129", tagColor: "bg-urgent/10 text-urgent", tag: "1 bill", valueColor: "text-urgent" },
									{ label: "Monthly Total", value: "$2,341", tag: "-3%", tagColor: "bg-success/10 text-success" },
									{ label: "Alerts", value: "3", tag: "1 urgent", tagColor: "bg-urgent/10 text-urgent" },
								].map((card) => (
									<div key={card.label} className="rounded-lg border border-border bg-white/[0.03] p-3.5">
										<div className="text-[9px] font-medium uppercase tracking-wide text-muted">{card.label}</div>
										<div className={`mt-1 font-mono text-xl font-medium ${card.valueColor ?? ""}`}>{card.value}</div>
										<span className={`mt-1 inline-block rounded px-1.5 py-px text-[9px] font-medium ${card.tagColor}`}>{card.tag}</span>
									</div>
								))}
							</div>
							{/* Panels */}
							<div className="grid gap-3 lg:grid-cols-2">
								<div className="overflow-hidden rounded-lg border border-border bg-white/[0.02]">
									<div className="border-b border-border/50 px-3.5 py-2.5 text-xs font-semibold">Upcoming Bills</div>
									{[
										{ name: "Chase Sapphire", due: "Due Mar 29", amount: "$542.32", urgency: "Due in 2 days", urgClass: "text-urgent" },
										{ name: "Con Edison", due: "Due Apr 1", amount: "$176.00", urgency: "Due in 5 days", urgClass: "text-warning" },
										{ name: "Netflix", due: "Due Apr 5", amount: "$22.99", urgency: "Due in 9 days", urgClass: "text-muted" },
									].map((row) => (
										<div key={row.name} className="flex items-center justify-between border-b border-white/[0.03] px-3.5 py-2.5 last:border-b-0">
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
								<div className="overflow-hidden rounded-lg border border-border bg-white/[0.02]">
									<div className="border-b border-border/50 px-3.5 py-2.5 text-xs font-semibold">Recent Alerts</div>
									{[
										{ type: "Price Increase", desc: "Netflix: $15.49 \u2192 $22.99 (+48%)", time: "2h ago", color: "bg-urgent", typeColor: "text-urgent" },
										{ type: "Unexpected Charge", desc: "Late fee $35.00 from Chase", time: "1d ago", color: "bg-warning", typeColor: "text-warning" },
										{ type: "New Biller", desc: "First charge: Cursor Pro \u2014 $20.00", time: "3d ago", color: "bg-accent", typeColor: "text-info" },
									].map((alert) => (
										<div key={alert.type} className="relative border-b border-white/[0.03] py-2.5 pl-5 pr-3.5 last:border-b-0">
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
				</div>
			</section>

			{/* Problem Section */}
			<section id="problem" className="relative overflow-hidden border-t border-border px-6 py-28 lg:py-36">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-urgent/[0.03] to-transparent" />
				<div className="relative mx-auto max-w-6xl">
					<span className="inline-flex items-center gap-2 rounded-full border border-urgent/15 bg-urgent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-urgent">
						<AlertTriangle size={14} /> The Problem
					</span>
					<h2 className="mt-5 text-4xl font-extrabold tracking-tight lg:text-5xl" style={{ lineHeight: 1.1 }}>
						You&apos;re paying more<br />than you realize
					</h2>
					<p className="mt-4 max-w-xl text-lg text-muted">
						Between subscriptions creeping up, late fees you missed, and charges from services you forgot about — your inbox holds the clues, but nobody&apos;s looking.
					</p>
					<div className="mt-14 grid gap-5 lg:grid-cols-3">
						{[
							{
								icon: TrendingUp,
								iconColor: "text-urgent bg-urgent/10",
								title: "Silent Price Increases",
								desc: "Streaming, SaaS, and subscription services raise prices quietly. A small email. A line in the fine print. Most people never notice.",
								stat: "73%",
								statLabel: "of users don't notice subscription price hikes",
							},
							{
								icon: DollarSign,
								iconColor: "text-warning bg-warning/10",
								title: "Hidden Fees That Add Up",
								desc: "Late fees, service charges, convenience fees, foreign transaction fees — small amounts that compound into real money over months.",
								stat: "$512",
								statLabel: "avg. lost per year to overlooked fees",
							},
							{
								icon: Mail,
								iconColor: "text-new bg-new/10",
								title: "Buried in Your Inbox",
								desc: "Payment confirmations, statements, and bill reminders all live in your email — scattered across promotions, updates, and spam.",
								stat: "47",
								statLabel: "avg. payment-related emails per month",
							},
						].map((card) => {
							const Icon = card.icon;
							return (
								<div key={card.title} className="rounded-xl border border-border bg-[#141419] p-8 transition-colors hover:border-white/10">
									<div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconColor}`}>
										<Icon size={20} />
									</div>
									<h3 className="mt-5 text-base font-semibold">{card.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted">{card.desc}</p>
									<div className="mt-6 border-t border-border pt-5">
										<span className="font-mono text-3xl font-bold">{card.stat}</span>
										<span className="ml-2 text-xs text-muted">{card.statLabel}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section id="how" className="border-t border-border px-6 py-28 lg:py-36">
				<div className="mx-auto max-w-6xl">
					<span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
						<Zap size={14} /> How It Works
					</span>
					<h2 className="mt-5 text-4xl font-extrabold tracking-tight lg:text-5xl">Three steps. Zero effort.</h2>
					<p className="mt-4 max-w-xl text-lg text-muted">
						Connect your Gmail, and PayWatch does the rest. No manual data entry. No spreadsheets. No forgetting.
					</p>
					<div className="mt-14 grid gap-5 lg:grid-cols-3">
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
						].map((step) => {
							const Icon = step.icon;
							return (
								<div key={step.num} className="rounded-xl border border-border bg-[#141419] p-8">
									<div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 font-mono text-sm font-bold text-accent">
										{step.num}
									</div>
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
										<Icon size={22} />
									</div>
									<h3 className="mt-5 text-base font-semibold">{step.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Smart Alerts Section */}
			<section className="border-t border-border px-6 py-28 lg:py-36">
				<div className="mx-auto max-w-6xl">
					<div className="grid items-start gap-16 lg:grid-cols-2">
						<div>
							<span className="inline-flex items-center gap-2 rounded-full border border-warning/15 bg-warning/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-warning">
								<Bell size={14} /> Smart Alerts
							</span>
							<h2 className="mt-5 text-4xl font-extrabold tracking-tight">Catches what you&apos;d miss</h2>
							<p className="mt-4 text-lg text-muted">
								PayWatch continuously monitors for three types of financial anomalies that cost you the most.
							</p>
							<div className="mt-10 space-y-6">
								{[
									{ icon: TrendingUp, color: "text-urgent bg-urgent/10", title: "Price Increases", desc: "Detects when a recurring bill amount changes and shows the exact increase with history." },
									{ icon: AlertTriangle, color: "text-warning bg-warning/10", title: "Unexpected Charges", desc: "Flags late fees, service charges, and amounts that deviate from your normal billing patterns." },
									{ icon: Plus, color: "text-info bg-info/10", title: "New Unknown Billers", desc: "Alerts you when a charge appears from a company you've never been billed by before." },
								].map((item) => {
									const Icon = item.icon;
									return (
										<div key={item.title} className="flex items-start gap-4">
											<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
												<Icon size={18} />
											</div>
											<div>
												<h4 className="text-sm font-semibold">{item.title}</h4>
												<p className="mt-1 text-sm text-muted">{item.desc}</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
						{/* Alerts mockup */}
						<div className="overflow-hidden rounded-2xl border border-border bg-[#141419] shadow-lg">
							<div className="flex items-center gap-2 border-b border-border bg-white/[0.02] px-4 py-3">
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
											desc: 'Netflix subscription increased from $15.49 to $22.99 (+48.3%). This is the second increase in 12 months.',
											meta: "Effective next billing cycle \u00b7 +$90/year impact",
										},
										{
											type: "Unexpected Late Fee",
											typeColor: "text-warning",
											bar: "bg-warning",
											time: "1 day ago",
											desc: "Chase Sapphire charged a $35.00 late fee. Your minimum payment of $142.00 was due 3 days ago.",
											meta: "Chase Sapphire Preferred",
										},
										{
											type: "New Biller Detected",
											typeColor: "text-info",
											bar: "bg-accent",
											time: "3 days ago",
											desc: "First charge detected from Cursor Pro for $20.00. Added to your biller list automatically.",
											meta: "Auto-tracked",
										},
									].map((alert) => (
										<div key={alert.type} className="relative rounded-lg border border-border bg-white/[0.02] py-4 pl-5 pr-4">
											<div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l ${alert.bar}`} />
											<div className="flex items-center justify-between">
												<span className={`text-xs font-semibold ${alert.typeColor}`}>{alert.type}</span>
												<span className="text-[10px] text-muted">{alert.time}</span>
											</div>
											<p className="mt-1.5 text-xs leading-relaxed text-muted">{alert.desc}</p>
											<p className="mt-2 text-[10px] text-[#5A5E66]">{alert.meta}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="border-t border-border px-6 py-28 lg:py-36">
				<div className="mx-auto max-w-6xl">
					<span className="inline-flex items-center gap-2 rounded-full border border-success/15 bg-success/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-success">
						<Zap size={14} /> Features
					</span>
					<h2 className="mt-5 text-4xl font-extrabold tracking-tight">Built for people who value their money</h2>
					<p className="mt-4 text-lg text-muted">Everything runs automatically. You just sign in and start saving.</p>
					<div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
								<div key={feature.title} className="rounded-xl border border-border bg-[#141419] p-7 transition-colors hover:border-white/10">
									<div className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}>
										<Icon size={20} />
									</div>
									<h3 className="mt-5 text-sm font-semibold">{feature.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted">{feature.desc}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Trust / Privacy */}
			<section className="border-t border-border px-6 py-28">
				<div className="mx-auto max-w-4xl text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
						<Shield size={28} />
					</div>
					<h2 className="mt-6 text-3xl font-extrabold tracking-tight lg:text-4xl">Your privacy is non-negotiable</h2>
					<p className="mx-auto mt-4 max-w-xl text-lg text-muted">
						PayWatch is designed with security at every layer. We never have more access than we need.
					</p>
					<div className="mt-12 grid gap-6 sm:grid-cols-3">
						{[
							{ icon: Lock, title: "Read-Only Access", desc: "We never send, modify, or delete your emails. Gmail scopes are restricted to read-only." },
							{ icon: Shield, title: "Encrypted Tokens", desc: "OAuth tokens are encrypted at rest in Supabase with row-level security enforced." },
							{ icon: Users, title: "Your Data, Your Control", desc: "Delete your account and all associated data at any time. No data retention after deletion." },
						].map((point) => {
							const Icon = point.icon;
							return (
								<div key={point.title} className="rounded-xl border border-border bg-[#141419] p-6">
									<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
										<Icon size={20} />
									</div>
									<h4 className="mt-4 text-sm font-semibold">{point.title}</h4>
									<p className="mt-2 text-sm text-muted">{point.desc}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="border-t border-border px-6 py-24 text-center lg:py-32">
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
			</section>

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
