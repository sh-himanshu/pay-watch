import { BILLER_RULES } from "@/lib/biller-rules";

const BILL_KEYWORDS = [
	"bill",
	"statement",
	"payment",
	"invoice",
	"due",
	"autopay",
	"auto-pay",
	"amount due",
	"balance",
	"receipt",
];

const KNOWN_DOMAINS = BILLER_RULES.flatMap((rule) =>
	rule.senderPatterns.map((p) => p.toLowerCase()),
);

export function isBillCandidate(subject: string, senderEmail: string): boolean {
	const lowerSubject = subject.toLowerCase();
	const lowerSender = senderEmail.toLowerCase();

	const hasKeyword = BILL_KEYWORDS.some((keyword) =>
		lowerSubject.includes(keyword),
	);
	if (hasKeyword) return true;

	const isKnownDomain = KNOWN_DOMAINS.some((domain) =>
		lowerSender.includes(domain),
	);
	if (isKnownDomain) return true;

	return false;
}
