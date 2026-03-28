export type BillerRule = {
	name: string;
	category: "subscription" | "utility" | "credit_card" | "insurance" | "other";
	senderPatterns: string[];
	subjectPatterns: RegExp[];
	extractors: {
		amount: RegExp;
		dueDate: RegExp;
	};
};

export const BILLER_RULES: BillerRule[] = [
	{
		name: "Netflix",
		category: "subscription",
		senderPatterns: ["netflix.com"],
		subjectPatterns: [/netflix/i, /your.*(?:bill|payment|receipt)/i],
		extractors: {
			amount: /\$\s?([\d,]+\.?\d{0,2})/,
			dueDate: /(?:due|payment date|charged on)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Spotify",
		category: "subscription",
		senderPatterns: ["spotify.com"],
		subjectPatterns: [/spotify.*receipt/i, /your.*spotify/i],
		extractors: {
			amount: /\$\s?([\d,]+\.?\d{0,2})/,
			dueDate: /(?:date|charged on)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Chase",
		category: "credit_card",
		senderPatterns: ["chase.com"],
		subjectPatterns: [/statement.*ready/i, /payment.*due/i, /chase.*bill/i],
		extractors: {
			amount: /(?:amount due|total|balance)[:\s]*\$\s?([\d,]+\.?\d{0,2})/i,
			dueDate: /(?:due date|payment due)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Amex",
		category: "credit_card",
		senderPatterns: ["americanexpress.com", "aexp.com"],
		subjectPatterns: [/statement.*ready/i, /amex/i, /american express/i],
		extractors: {
			amount: /(?:amount due|total|balance)[:\s]*\$\s?([\d,]+\.?\d{0,2})/i,
			dueDate: /(?:due date|payment due)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Con Edison",
		category: "utility",
		senderPatterns: ["coned.com", "conedison.com"],
		subjectPatterns: [/con\s?ed/i, /your.*bill/i],
		extractors: {
			amount: /(?:amount due|total)[:\s]*\$\s?([\d,]+\.?\d{0,2})/i,
			dueDate: /(?:due date|due by)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "AT&T",
		category: "utility",
		senderPatterns: ["att.com", "att-mail.com"],
		subjectPatterns: [/at&t.*bill/i, /your.*at&t/i],
		extractors: {
			amount: /\$\s?([\d,]+\.?\d{0,2})/,
			dueDate: /(?:due date|due by)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Verizon",
		category: "utility",
		senderPatterns: ["verizon.com", "verizonwireless.com"],
		subjectPatterns: [/verizon.*bill/i, /your.*verizon/i],
		extractors: {
			amount: /\$\s?([\d,]+\.?\d{0,2})/,
			dueDate: /(?:due date|due by)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "AWS",
		category: "subscription",
		senderPatterns: ["amazon.com", "aws.amazon.com"],
		subjectPatterns: [/aws.*billing/i, /amazon web services.*available/i],
		extractors: {
			amount: /(?:total)[:\s]*\$\s?([\d,]+\.?\d{0,2})/i,
			dueDate: /(?:due date|billing period)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Google Cloud",
		category: "subscription",
		senderPatterns: ["google.com", "cloud-noreply@google.com"],
		subjectPatterns: [/google cloud.*invoice/i, /gcp.*billing/i],
		extractors: {
			amount: /(?:total|amount)[:\s]*\$\s?([\d,]+\.?\d{0,2})/i,
			dueDate: /(?:due date|invoice date)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
	{
		name: "Adobe",
		category: "subscription",
		senderPatterns: ["adobe.com"],
		subjectPatterns: [/adobe.*invoice/i, /creative cloud/i, /your.*adobe/i],
		extractors: {
			amount: /\$\s?([\d,]+\.?\d{0,2})/,
			dueDate: /(?:date|charged on)[:\s]*(\w+ \d{1,2},?\s?\d{4})/i,
		},
	},
];

export function findMatchingRule(
	senderEmail: string,
	subject: string,
): BillerRule | null {
	const senderDomain = senderEmail.split("@").pop()?.toLowerCase() ?? "";

	for (const rule of BILLER_RULES) {
		const senderMatch = rule.senderPatterns.some(
			(pattern) =>
				senderDomain.includes(pattern.toLowerCase()) ||
				senderEmail.toLowerCase().includes(pattern.toLowerCase()),
		);

		const subjectMatch = rule.subjectPatterns.some((pattern) =>
			pattern.test(subject),
		);

		if (senderMatch || subjectMatch) {
			return rule;
		}
	}

	return null;
}
