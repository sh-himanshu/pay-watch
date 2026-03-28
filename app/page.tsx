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
