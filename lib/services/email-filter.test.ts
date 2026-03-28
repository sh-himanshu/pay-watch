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
