# PayWatch Phase 2: Core Backend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the email parsing pipeline (Gmail sync, rule-based parser, LLM fallback), fee detection engine, and all API routes including cron jobs.

**Architecture:** Service layer modules in `lib/services/` called by API route handlers in `app/api/`. The sync flow: Gmail API fetch → filter candidates → parse (rules then LLM) → upsert bill + biller → run fee detection → create alerts. Cron jobs use the admin (service-role) Supabase client to bypass RLS.

**Tech Stack:** Gmail API (`googleapis`), OpenAI (`openai`), Supabase, TypeScript, Vitest

**Spec references:** `docs/superpowers/specs/paywatch/02-email-parsing.md`, `docs/superpowers/specs/paywatch/03-fee-detection.md`, `docs/superpowers/specs/paywatch/06-auth-api-routes.md`

**Prerequisites:** Phase 1 complete (Supabase clients, DB schema, auth flow working).

---

### Task 1: Biller Rules Registry

**Files:**
- Create: `lib/biller-rules.ts`
- Create: `lib/biller-rules.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/biller-rules.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { findMatchingRule } from "./biller-rules";

describe("findMatchingRule", () => {
	it("matches Netflix by sender domain", () => {
		const rule = findMatchingRule("info@mailer.netflix.com", "Your Netflix bill");
		expect(rule).not.toBeNull();
		expect(rule!.name).toBe("Netflix");
	});

	it("matches Chase by subject pattern", () => {
		const rule = findMatchingRule(
			"no-reply@chase.com",
			"Your credit card statement is ready",
		);
		expect(rule).not.toBeNull();
		expect(rule!.name).toBe("Chase");
	});

	it("returns null for unknown sender", () => {
		const rule = findMatchingRule("hello@random.com", "Hey there");
		expect(rule).toBeNull();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/biller-rules.test.ts
```

Expected: FAIL — `findMatchingRule` is not defined.

- [ ] **Step 3: Implement biller rules**

Create `lib/biller-rules.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/biller-rules.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/biller-rules.ts lib/biller-rules.test.ts
git commit -m "feat: add biller rules registry with 10 known billers"
```

---

### Task 2: Email Filter

**Files:**
- Create: `lib/services/email-filter.ts`
- Create: `lib/services/email-filter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/services/email-filter.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { isBillCandidate } from "./email-filter";

describe("isBillCandidate", () => {
	it("accepts email with bill keywords in subject", () => {
		expect(isBillCandidate("Your monthly bill is ready", "noreply@example.com")).toBe(true);
	});

	it("accepts email with payment keyword in subject", () => {
		expect(isBillCandidate("Payment due soon", "billing@att.com")).toBe(true);
	});

	it("accepts email from known biller domain", () => {
		expect(isBillCandidate("Hello from us", "noreply@netflix.com")).toBe(true);
	});

	it("rejects unrelated email", () => {
		expect(isBillCandidate("Team standup notes", "coworker@company.com")).toBe(false);
	});

	it("is case-insensitive", () => {
		expect(isBillCandidate("YOUR STATEMENT IS READY", "info@bank.com")).toBe(true);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/services/email-filter.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement email filter**

Create `lib/services/email-filter.ts`:

```typescript
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

	// Check subject for bill keywords
	const hasKeyword = BILL_KEYWORDS.some((keyword) =>
		lowerSubject.includes(keyword),
	);
	if (hasKeyword) return true;

	// Check sender against known biller domains
	const isKnownDomain = KNOWN_DOMAINS.some((domain) =>
		lowerSender.includes(domain),
	);
	if (isKnownDomain) return true;

	return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/services/email-filter.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/email-filter.ts lib/services/email-filter.test.ts
git commit -m "feat: add email filter with keyword and domain heuristics"
```

---

### Task 3: Rule-Based Parser

**Files:**
- Create: `lib/services/parser-rules.ts`
- Create: `lib/services/parser-rules.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/services/parser-rules.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { parseWithRules } from "./parser-rules";

describe("parseWithRules", () => {
	it("extracts amount and due date from Netflix email", () => {
		const result = parseWithRules(
			"info@mailer.netflix.com",
			"Your Netflix bill",
			"Your subscription is $15.99. Payment date: January 15, 2026.",
		);
		expect(result).not.toBeNull();
		expect(result!.billerName).toBe("Netflix");
		expect(result!.amount).toBe(15.99);
		expect(result!.dueDate).toBe("January 15, 2026");
		expect(result!.confidence).toBeGreaterThanOrEqual(0.9);
	});

	it("extracts from Chase statement email", () => {
		const result = parseWithRules(
			"no-reply@chase.com",
			"Your credit card statement is ready",
			"Amount due: $542.32. Due date: February 10, 2026.",
		);
		expect(result).not.toBeNull();
		expect(result!.billerName).toBe("Chase");
		expect(result!.amount).toBe(542.32);
	});

	it("returns null for unknown sender", () => {
		const result = parseWithRules(
			"hello@random.com",
			"Hello there",
			"Some random text",
		);
		expect(result).toBeNull();
	});

	it("returns partial result if amount found but no due date", () => {
		const result = parseWithRules(
			"info@netflix.com",
			"Netflix receipt",
			"You were charged $15.99",
		);
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(15.99);
		expect(result!.dueDate).toBeNull();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/services/parser-rules.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement rule-based parser**

Create `lib/services/parser-rules.ts`:

```typescript
import { type BillerRule, findMatchingRule } from "@/lib/biller-rules";

export type ParseResult = {
	billerName: string;
	billerCategory: BillerRule["category"];
	amount: number;
	dueDate: string | null;
	confidence: number;
	parsedBy: "rules";
};

export function parseWithRules(
	senderEmail: string,
	subject: string,
	body: string,
): ParseResult | null {
	const rule = findMatchingRule(senderEmail, subject);
	if (!rule) return null;

	const amountMatch = body.match(rule.extractors.amount);
	if (!amountMatch) return null;

	const amount = Number.parseFloat(amountMatch[1].replace(/,/g, ""));
	if (Number.isNaN(amount) || amount <= 0) return null;

	const dueDateMatch = body.match(rule.extractors.dueDate);
	const dueDate = dueDateMatch ? dueDateMatch[1].trim() : null;

	const confidence = dueDate ? 0.95 : 0.9;

	return {
		billerName: rule.name,
		billerCategory: rule.category,
		amount,
		dueDate,
		confidence,
		parsedBy: "rules",
	};
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/services/parser-rules.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/parser-rules.ts lib/services/parser-rules.test.ts
git commit -m "feat: add rule-based email parser with regex extraction"
```

---

### Task 4: LLM Fallback Parser

**Files:**
- Create: `lib/services/parser-llm.ts`
- Create: `lib/services/parser-llm.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/services/parser-llm.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";
import { parseWithLLM } from "./parser-llm";

// Mock the OpenAI client
vi.mock("openai", () => {
	return {
		default: class {
			chat = {
				completions: {
					create: vi.fn().mockResolvedValue({
						choices: [
							{
								message: {
									content: JSON.stringify({
										biller: "Unknown Electric Co",
										amount: 87.5,
										due_date: "2026-02-15",
									}),
								},
							},
						],
					}),
				},
			};
		},
	};
});

describe("parseWithLLM", () => {
	it("extracts billing info from email body", async () => {
		const result = await parseWithLLM(
			"Your bill from Unknown Electric Co is $87.50 due February 15, 2026.",
		);
		expect(result).not.toBeNull();
		expect(result!.billerName).toBe("Unknown Electric Co");
		expect(result!.amount).toBe(87.5);
		expect(result!.dueDate).toBe("2026-02-15");
		expect(result!.parsedBy).toBe("llm");
		expect(result!.confidence).toBeLessThanOrEqual(0.9);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/services/parser-llm.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement LLM parser**

Create `lib/services/parser-llm.ts`:

```typescript
import OpenAI from "openai";

export type LLMParseResult = {
	billerName: string;
	billerCategory: "other";
	amount: number;
	dueDate: string | null;
	confidence: number;
	parsedBy: "llm";
};

const SYSTEM_PROMPT = `You extract billing information from emails. Return ONLY a JSON object with these fields:
- biller: string (the company name)
- amount: number (the dollar amount)
- due_date: string | null (ISO date format YYYY-MM-DD, or null if not found)

If you cannot identify billing information, return: {"biller": null, "amount": null, "due_date": null}`;

export async function parseWithLLM(
	emailBody: string,
): Promise<LLMParseResult | null> {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	// Truncate to ~2000 tokens worth of text
	const truncatedBody = emailBody.slice(0, 8000);

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: truncatedBody },
			],
			temperature: 0,
			max_tokens: 200,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) return null;

		const parsed = JSON.parse(content) as {
			biller: string | null;
			amount: number | null;
			due_date: string | null;
		};

		if (!parsed.biller || !parsed.amount || parsed.amount <= 0) return null;

		return {
			billerName: parsed.biller,
			billerCategory: "other",
			amount: parsed.amount,
			dueDate: parsed.due_date,
			confidence: parsed.due_date ? 0.8 : 0.65,
			parsedBy: "llm",
		};
	} catch {
		return null;
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/services/parser-llm.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/parser-llm.ts lib/services/parser-llm.test.ts
git commit -m "feat: add LLM fallback parser using OpenAI gpt-4o-mini"
```

---

### Task 5: Fee Detection Engine

**Files:**
- Create: `lib/services/fee-detection.ts`
- Create: `lib/services/fee-detection.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/services/fee-detection.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
	detectPriceIncrease,
	detectUnexpectedCharge,
	type FeeDetectionAlert,
} from "./fee-detection";

describe("detectPriceIncrease", () => {
	it("detects >5% price increase as warning", () => {
		const alert = detectPriceIncrease(15.99, 14.99);
		expect(alert).not.toBeNull();
		expect(alert!.type).toBe("price_increase");
		expect(alert!.severity).toBe("warning");
		expect(alert!.metadata.percent_change).toBeGreaterThan(5);
	});

	it("upgrades to urgent for >20% increase", () => {
		const alert = detectPriceIncrease(24.99, 14.99);
		expect(alert).not.toBeNull();
		expect(alert!.severity).toBe("urgent");
	});

	it("returns null for <5% change", () => {
		const alert = detectPriceIncrease(15.2, 14.99);
		expect(alert).toBeNull();
	});

	it("returns null when typical amount is null", () => {
		const alert = detectPriceIncrease(15.99, null);
		expect(alert).toBeNull();
	});
});

describe("detectUnexpectedCharge", () => {
	it("detects fee keywords in email body", () => {
		const alert = detectUnexpectedCharge(
			50.0,
			[40.0, 40.0, 40.0, 40.0],
			"You have been charged a late fee of $10.00",
		);
		expect(alert).not.toBeNull();
		expect(alert!.type).toBe("unexpected_charge");
		expect(alert!.metadata.reason).toContain("late fee");
	});

	it("detects statistical outlier (>2 std dev)", () => {
		const alert = detectUnexpectedCharge(
			200.0,
			[40.0, 42.0, 38.0, 41.0, 39.0, 40.0],
			"Your monthly bill",
		);
		expect(alert).not.toBeNull();
		expect(alert!.type).toBe("unexpected_charge");
	});

	it("returns null for normal amount", () => {
		const alert = detectUnexpectedCharge(
			41.0,
			[40.0, 42.0, 38.0, 41.0, 39.0, 40.0],
			"Your monthly bill",
		);
		expect(alert).toBeNull();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/services/fee-detection.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement fee detection**

Create `lib/services/fee-detection.ts`:

```typescript
export type FeeDetectionAlert = {
	type: "price_increase" | "unexpected_charge" | "new_biller";
	severity: "urgent" | "warning" | "info";
	title: string;
	description: string;
	metadata: Record<string, unknown>;
};

const FEE_KEYWORDS = [
	"late fee",
	"service charge",
	"convenience fee",
	"foreign transaction",
	"overdraft",
	"penalty",
	"surcharge",
];

export function detectPriceIncrease(
	newAmount: number,
	typicalAmount: number | null,
): FeeDetectionAlert | null {
	if (typicalAmount === null || typicalAmount <= 0) return null;

	const percentChange = ((newAmount - typicalAmount) / typicalAmount) * 100;

	if (percentChange <= 5) return null;

	const severity = percentChange > 20 ? "urgent" : "warning";

	return {
		type: "price_increase",
		severity,
		title: `Price increased by ${Math.round(percentChange)}%`,
		description: `Expected ~$${typicalAmount.toFixed(2)}, charged $${newAmount.toFixed(2)}.`,
		metadata: {
			previous_amount: typicalAmount,
			new_amount: newAmount,
			percent_change: Math.round(percentChange * 100) / 100,
		},
	};
}

export function detectUnexpectedCharge(
	amount: number,
	historicalAmounts: number[],
	emailBody: string,
): FeeDetectionAlert | null {
	// Check for fee keywords in email body
	const lowerBody = emailBody.toLowerCase();
	const matchedKeyword = FEE_KEYWORDS.find((kw) => lowerBody.includes(kw));

	if (matchedKeyword) {
		return {
			type: "unexpected_charge",
			severity: "warning",
			title: "Unexpected fee detected",
			description: `Found "${matchedKeyword}" in billing email.`,
			metadata: {
				actual_amount: amount,
				reason: matchedKeyword,
			},
		};
	}

	// Statistical outlier detection (>2 std dev)
	if (historicalAmounts.length < 3) return null;

	const mean =
		historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
	const variance =
		historicalAmounts.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
		historicalAmounts.length;
	const stdDev = Math.sqrt(variance);

	if (stdDev === 0) return null;

	const deviations = Math.abs(amount - mean) / stdDev;

	if (deviations > 2) {
		return {
			type: "unexpected_charge",
			severity: "warning",
			title: "Unusual charge amount",
			description: `$${amount.toFixed(2)} is significantly different from your typical ~$${mean.toFixed(2)}.`,
			metadata: {
				expected_range: {
					low: Math.round((mean - 2 * stdDev) * 100) / 100,
					high: Math.round((mean + 2 * stdDev) * 100) / 100,
				},
				actual_amount: amount,
				reason: "statistical_outlier",
			},
		};
	}

	return null;
}

export function detectNewBiller(
	billerName: string,
	amount: number,
	sourceEmailSubject: string,
): FeeDetectionAlert {
	return {
		type: "new_biller",
		severity: "info",
		title: `New biller detected: ${billerName}`,
		description: `First bill from ${billerName} for $${amount.toFixed(2)}.`,
		metadata: {
			biller_name: billerName,
			first_amount: amount,
			source_email: sourceEmailSubject,
		},
	};
}

export function computeRollingAverage(amounts: number[]): number {
	const recent = amounts.slice(-6);
	return recent.reduce((a, b) => a + b, 0) / recent.length;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/services/fee-detection.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/fee-detection.ts lib/services/fee-detection.test.ts
git commit -m "feat: add fee detection engine (price increase, unexpected charge, new biller)"
```

---

### Task 6: Email Sync Orchestrator

**Files:**
- Create: `lib/services/email-sync.ts`

This is the main pipeline that ties Gmail API, filtering, parsing, and fee detection together.

- [ ] **Step 1: Create the orchestrator**

Create `lib/services/email-sync.ts`:

```typescript
import { google } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isBillCandidate } from "./email-filter";
import { parseWithRules } from "./parser-rules";
import { parseWithLLM } from "./parser-llm";
import {
	detectPriceIncrease,
	detectUnexpectedCharge,
	detectNewBiller,
	computeRollingAverage,
} from "./fee-detection";
import type { EmailAccount } from "@/lib/types";

type SyncResult = {
	billsCreated: number;
	alertsCreated: number;
	errors: string[];
};

export async function syncEmailAccount(
	supabase: SupabaseClient,
	account: EmailAccount,
): Promise<SyncResult> {
	const result: SyncResult = { billsCreated: 0, alertsCreated: 0, errors: [] };

	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: account.access_token,
		refresh_token: account.refresh_token,
	});

	const gmail = google.gmail({ version: "v1", auth: oauth2Client });

	// Build query for emails since last sync (or last 30 days)
	const sinceDate = account.last_synced_at
		? new Date(account.last_synced_at)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const afterTimestamp = Math.floor(sinceDate.getTime() / 1000);

	let messages: { id: string }[] = [];
	try {
		const listResponse = await gmail.users.messages.list({
			userId: "me",
			q: `after:${afterTimestamp}`,
			maxResults: 100,
		});
		messages = (listResponse.data.messages ?? []) as { id: string }[];
	} catch (error) {
		result.errors.push(`Failed to list messages: ${error}`);
		return result;
	}

	let llmCallCount = 0;

	for (const msg of messages) {
		try {
			const detail = await gmail.users.messages.get({
				userId: "me",
				id: msg.id,
				format: "full",
			});

			const headers = detail.data.payload?.headers ?? [];
			const subject =
				headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
			const from =
				headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
			const date =
				headers.find((h) => h.name?.toLowerCase() === "date")?.value ?? "";

			// Extract sender email from "Name <email>" format
			const senderMatch = from.match(/<(.+?)>/) ?? [null, from];
			const senderEmail = senderMatch[1] ?? from;

			if (!isBillCandidate(subject, senderEmail)) continue;

			// Extract plain text body
			const body = extractTextBody(detail.data.payload) ?? "";

			// Try rule-based parser first
			let parseResult = parseWithRules(senderEmail, subject, body);

			// Fall back to LLM if rules didn't match
			if (!parseResult && llmCallCount < 50) {
				llmCallCount++;
				parseResult = await parseWithLLM(body);
			}

			if (!parseResult) continue;

			// Validate: amount must be positive
			if (parseResult.amount <= 0) continue;

			// Upsert biller
			const { data: biller, error: billerError } = await supabase
				.from("billers")
				.upsert(
					{
						user_id: account.user_id,
						name: parseResult.billerName,
						category: parseResult.billerCategory,
						first_seen_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,name" },
				)
				.select()
				.single();

			if (billerError || !biller) {
				result.errors.push(
					`Failed to upsert biller ${parseResult.billerName}: ${billerError?.message}`,
				);
				continue;
			}

			// Parse due date to ISO format
			const dueDate = parseDueDate(parseResult.dueDate);

			// Insert bill (unique on user_id + biller_id + source_email_id)
			const { data: bill, error: billError } = await supabase
				.from("bills")
				.upsert(
					{
						user_id: account.user_id,
						biller_id: biller.id,
						email_account_id: account.id,
						amount: parseResult.amount,
						due_date: dueDate,
						status: computeBillStatus(dueDate),
						source_email_id: msg.id,
						source_email_subject: subject,
						source_email_date: new Date(date).toISOString(),
						parsed_by: parseResult.parsedBy,
						confidence: parseResult.confidence,
					},
					{ onConflict: "user_id,biller_id,source_email_id" },
				)
				.select()
				.single();

			if (billError) {
				result.errors.push(`Failed to insert bill: ${billError.message}`);
				continue;
			}

			result.billsCreated++;

			// Run fee detection
			const alerts = await runFeeDetection(
				supabase,
				account.user_id,
				biller,
				bill,
				body,
				subject,
			);
			result.alertsCreated += alerts;

			// Update biller typical_amount with rolling average
			const { data: recentBills } = await supabase
				.from("bills")
				.select("amount")
				.eq("biller_id", biller.id)
				.order("created_at", { ascending: false })
				.limit(6);

			if (recentBills && recentBills.length > 0) {
				const avg = computeRollingAverage(
					recentBills.map((b) => Number(b.amount)),
				);
				await supabase
					.from("billers")
					.update({ typical_amount: avg })
					.eq("id", biller.id);
			}
		} catch (error) {
			result.errors.push(`Error processing message ${msg.id}: ${error}`);
		}
	}

	// Update last_synced_at
	await supabase
		.from("email_accounts")
		.update({ last_synced_at: new Date().toISOString() })
		.eq("id", account.id);

	return result;
}

async function runFeeDetection(
	supabase: SupabaseClient,
	userId: string,
	biller: { id: string; name: string; typical_amount: number | null; first_seen_at: string },
	bill: { id: string; amount: number },
	emailBody: string,
	emailSubject: string,
): Promise<number> {
	let alertCount = 0;

	// Check if this is a new biller (first_seen_at within last minute)
	const isNew =
		new Date(biller.first_seen_at).getTime() > Date.now() - 60 * 1000;

	if (isNew) {
		const alert = detectNewBiller(
			biller.name,
			Number(bill.amount),
			emailSubject,
		);
		await insertAlert(supabase, userId, bill.id, biller.id, alert);
		alertCount++;
	}

	// Price increase detection
	const priceAlert = detectPriceIncrease(
		Number(bill.amount),
		biller.typical_amount,
	);
	if (priceAlert) {
		priceAlert.title = `${biller.name} ${priceAlert.title.toLowerCase()}`;
		await insertAlert(supabase, userId, bill.id, biller.id, priceAlert);
		alertCount++;
	}

	// Unexpected charge detection
	const { data: history } = await supabase
		.from("bills")
		.select("amount")
		.eq("biller_id", biller.id)
		.neq("id", bill.id)
		.order("created_at", { ascending: false })
		.limit(10);

	if (history) {
		const unexpectedAlert = detectUnexpectedCharge(
			Number(bill.amount),
			history.map((b) => Number(b.amount)),
			emailBody,
		);
		if (unexpectedAlert) {
			await insertAlert(supabase, userId, bill.id, biller.id, unexpectedAlert);
			alertCount++;
		}
	}

	return alertCount;
}

async function insertAlert(
	supabase: SupabaseClient,
	userId: string,
	billId: string,
	billerId: string,
	alert: { type: string; severity: string; title: string; description: string; metadata: Record<string, unknown> },
): Promise<void> {
	await supabase.from("alerts").insert({
		user_id: userId,
		bill_id: billId,
		biller_id: billerId,
		type: alert.type,
		severity: alert.severity,
		title: alert.title,
		description: alert.description,
		metadata: alert.metadata,
	});
}

function extractTextBody(
	payload: { mimeType?: string; body?: { data?: string }; parts?: unknown[] } | undefined,
): string | null {
	if (!payload) return null;

	if (payload.mimeType === "text/plain" && payload.body?.data) {
		return Buffer.from(payload.body.data, "base64url").toString("utf-8");
	}

	if (payload.parts) {
		for (const part of payload.parts as typeof payload[]) {
			const text = extractTextBody(part);
			if (text) return text;
		}
	}

	return null;
}

function parseDueDate(dateStr: string | null): string {
	if (!dateStr) {
		// Default to 30 days from now if no due date found
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().split("T")[0];
	}

	const parsed = new Date(dateStr);
	if (Number.isNaN(parsed.getTime())) {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().split("T")[0];
	}

	return parsed.toISOString().split("T")[0];
}

function computeBillStatus(dueDate: string): "upcoming" | "due_soon" | "overdue" {
	const due = new Date(dueDate);
	const now = new Date();
	const diffDays = Math.ceil(
		(due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays < 0) return "overdue";
	if (diffDays <= 3) return "due_soon";
	return "upcoming";
}
```

- [ ] **Step 2: Add unique constraint on billers for upsert**

Run this SQL in Supabase:

```sql
create unique index billers_user_name_idx on public.billers (user_id, name);
```

- [ ] **Step 3: Commit**

```bash
git add lib/services/email-sync.ts
git commit -m "feat: add email sync orchestrator (Gmail fetch, parse, upsert, fee detection)"
```

---

### Task 7: API Routes

**Files:**
- Create: `app/api/sync/route.ts`
- Create: `app/api/cron/sync-all/route.ts`
- Create: `app/api/cron/reminders/route.ts`
- Create: `app/api/alerts/[id]/dismiss/route.ts`
- Create: `app/api/alerts/[id]/read/route.ts`

- [ ] **Step 1: Create manual sync route**

Create `app/api/sync/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { syncEmailAccount } from "@/lib/services/email-sync";
import type { EmailAccount } from "@/lib/types";

export async function POST() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("*")
		.eq("user_id", user.id)
		.eq("sync_status", "active");

	if (!accounts || accounts.length === 0) {
		return Response.json({ error: "No active email accounts" }, { status: 404 });
	}

	const results = [];
	for (const account of accounts) {
		const result = await syncEmailAccount(supabase, account as EmailAccount);
		results.push(result);
	}

	return Response.json({ results });
}
```

- [ ] **Step 2: Create cron sync-all route**

Create `app/api/cron/sync-all/route.ts`:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import { syncEmailAccount } from "@/lib/services/email-sync";
import type { EmailAccount } from "@/lib/types";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createAdminClient();

	const { data: accounts } = await supabase
		.from("email_accounts")
		.select("*")
		.eq("sync_status", "active");

	if (!accounts || accounts.length === 0) {
		return Response.json({ message: "No accounts to sync" });
	}

	const results = [];
	for (const account of accounts) {
		const result = await syncEmailAccount(supabase, account as EmailAccount);
		results.push({ account_id: account.id, ...result });
	}

	return Response.json({ synced: accounts.length, results });
}
```

- [ ] **Step 3: Create cron reminders route**

Create `app/api/cron/reminders/route.ts`:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createAdminClient();

	// Find bills where due_date - reminder_days = today
	const { data: prefs } = await supabase
		.from("notification_preferences")
		.select("user_id, reminder_days_before")
		.eq("alert_due_reminder", true);

	if (!prefs) return Response.json({ reminders: 0 });

	let reminderCount = 0;

	for (const pref of prefs) {
		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() + pref.reminder_days_before);
		const dateStr = targetDate.toISOString().split("T")[0];

		const { data: bills } = await supabase
			.from("bills")
			.select("*, billers(name)")
			.eq("user_id", pref.user_id)
			.eq("due_date", dateStr)
			.in("status", ["upcoming", "due_soon"]);

		if (!bills) continue;

		// Update status to due_soon
		for (const bill of bills) {
			await supabase
				.from("bills")
				.update({ status: "due_soon" })
				.eq("id", bill.id);
			reminderCount++;
		}
	}

	// Also mark overdue bills
	const today = new Date().toISOString().split("T")[0];
	await supabase
		.from("bills")
		.update({ status: "overdue" })
		.lt("due_date", today)
		.in("status", ["upcoming", "due_soon"]);

	return Response.json({ reminders: reminderCount });
}
```

- [ ] **Step 4: Create alert action routes**

Create `app/api/alerts/[id]/dismiss/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { error } = await supabase
		.from("alerts")
		.update({ is_dismissed: true })
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	return Response.json({ success: true });
}
```

Create `app/api/alerts/[id]/read/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { error } = await supabase
		.from("alerts")
		.update({ is_read: true })
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		return Response.json({ error: error.message }, { status: 400 });
	}

	return Response.json({ success: true });
}
```

- [ ] **Step 5: Create Vercel cron config**

Create `vercel.json`:

```json
{
	"crons": [
		{
			"path": "/api/cron/sync-all",
			"schedule": "*/15 * * * *"
		},
		{
			"path": "/api/cron/reminders",
			"schedule": "0 8 * * *"
		}
	]
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/ vercel.json
git commit -m "feat: add API routes (sync, cron sync-all, cron reminders, alert actions) and vercel cron config"
```

---

### Task 8: Build Verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (biller-rules, email-filter, parser-rules, parser-llm, fee-detection).

- [ ] **Step 2: Run the build**

```bash
pnpm build
```

Expected: Build succeeds. Fix any type errors before proceeding.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build/test issues from phase 2 verification"
```

(Skip if no fixes needed.)
