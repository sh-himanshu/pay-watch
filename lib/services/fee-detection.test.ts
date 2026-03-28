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
