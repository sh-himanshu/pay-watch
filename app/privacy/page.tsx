import Link from "next/link";

export const metadata = {
	title: "Privacy Policy — PayWatch",
};

export default function PrivacyPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<Link href="/" className="text-sm text-muted hover:text-foreground">
				&larr; Back to home
			</Link>

			<h1 className="mt-8 text-3xl font-bold">Privacy Policy</h1>
			<p className="mt-2 text-sm text-muted">Last updated: March 28, 2026</p>

			<div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
				<section>
					<h2 className="text-lg font-semibold text-foreground">1. What We Collect</h2>
					<p className="mt-2">
						When you sign in with Google, PayWatch requests <strong>read-only</strong> access to your Gmail account. We only scan emails from known billers and payment providers to extract bill amounts, due dates, and biller names. We do not read personal emails, attachments, or any content unrelated to bills and payments.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li>Display your bills, due dates, and payment history on your dashboard.</li>
						<li>Detect anomalies such as price increases, unexpected charges, and new billers.</li>
						<li>Send you alerts via push notifications or email digest (if enabled).</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">3. Data Storage &amp; Security</h2>
					<p className="mt-2">
						Your data is stored in a secure Supabase (PostgreSQL) database. OAuth tokens are encrypted at rest. We use HTTPS for all data in transit. Your financial data never leaves your account and is not shared with third parties.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">4. AI Processing</h2>
					<p className="mt-2">
						For emails from unrecognized billers, we use OpenAI to parse bill details. Only the relevant email snippet (subject line and payment-related content) is sent for processing. No full email bodies or personal content are shared.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
					<ul className="mt-2 list-disc space-y-1 pl-5">
						<li><strong>Supabase</strong> — Database and authentication.</li>
						<li><strong>Google Gmail API</strong> — Read-only email access for bill detection.</li>
						<li><strong>OpenAI</strong> — LLM fallback parsing for unrecognized billers.</li>
						<li><strong>Resend</strong> — Transactional email delivery for digest notifications.</li>
						<li><strong>Vercel</strong> — Application hosting.</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
					<p className="mt-2">
						You can revoke Gmail access at any time from your <a href="https://myaccount.google.com/permissions" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">Google Account permissions</a>. You may request deletion of all your data by contacting us. Upon deletion, all stored bills, alerts, and account data are permanently removed.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
					<p className="mt-2">
						For privacy-related questions, reach out at <a href="mailto:himanshu.sh1220@gmail.com" className="underline hover:text-foreground">himanshu.sh1220@gmail.com</a>.
					</p>
				</section>
			</div>
		</div>
	);
}
