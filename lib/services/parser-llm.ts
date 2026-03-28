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
