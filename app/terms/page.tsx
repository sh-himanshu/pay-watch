import Link from "next/link";

export const metadata = {
	title: "Terms of Service — PayWatch",
};

export default function TermsPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<Link href="/" className="text-sm text-muted hover:text-foreground">
				&larr; Back to home
			</Link>

			<h1 className="mt-8 text-3xl font-bold">Terms of Service</h1>
			<p className="mt-2 text-sm text-muted">Last updated: March 28, 2026</p>

			<div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
				<section>
					<h2 className="text-lg font-semibold text-foreground">1. Acceptance</h2>
					<p className="mt-2">
						By using PayWatch, you agree to these terms. If you do not agree, do not use the service.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">2. Service Description</h2>
					<p className="mt-2">
						PayWatch is a personal finance tool that connects to your Gmail (read-only) to automatically detect bills, subscriptions, and payments. It provides a dashboard to track due dates, alerts for anomalies, and optional notification digests. PayWatch is provided as-is for personal, non-commercial use.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">3. Account &amp; Access</h2>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li>You must sign in with a valid Google account.</li>
						<li>You are responsible for maintaining the security of your account.</li>
						<li>You may revoke access at any time via your Google Account settings.</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">4. Data Accuracy</h2>
					<p className="mt-2">
						PayWatch uses automated parsing (rule-based and AI-powered) to extract bill information from emails. While we aim for high accuracy, we do not guarantee that all amounts, due dates, or biller details are correct. Always verify important financial information independently.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">5. Limitations of Liability</h2>
					<p className="mt-2">
						PayWatch is not a financial advisor. We are not liable for missed payments, incorrect alerts, or any financial decisions made based on information provided by the service. Use at your own discretion.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">6. Prohibited Use</h2>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li>Do not use PayWatch to process accounts you do not own.</li>
						<li>Do not attempt to reverse-engineer, scrape, or abuse the service.</li>
						<li>Do not use the service for any unlawful purpose.</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">7. Termination</h2>
					<p className="mt-2">
						We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account and all associated data at any time by contacting us.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">8. Changes</h2>
					<p className="mt-2">
						We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
					<p className="mt-2">
						Questions about these terms? Email <a href="mailto:himanshu.sh1220@gmail.com" className="underline hover:text-foreground">himanshu.sh1220@gmail.com</a>.
					</p>
				</section>
			</div>
		</div>
	);
}
