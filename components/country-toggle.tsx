"use client";

import { useCountry, type Country } from "@/components/country-provider";

const FLAGS: Record<Country, string> = {
	US: "🇺🇸",
	IN: "🇮🇳",
};

export function CountryToggle() {
	const { country, setCountry } = useCountry();

	return (
		<button
			type="button"
			onClick={() => setCountry(country === "US" ? "IN" : "US")}
			className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-2.5 text-sm font-medium transition-colors hover:bg-surface-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			aria-label={`Switch to ${country === "US" ? "India" : "United States"}`}
		>
			<span className="text-base leading-none">{FLAGS[country]}</span>
			<span className="hidden text-xs text-muted sm:inline">
				{country === "US" ? "USD" : "INR"}
			</span>
		</button>
	);
}
