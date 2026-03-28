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
