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
