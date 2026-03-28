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
