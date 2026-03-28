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
