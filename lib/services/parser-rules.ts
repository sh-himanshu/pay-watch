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
