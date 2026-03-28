"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";

export type Country = "US" | "IN";

type CountryContextValue = {
	country: Country;
	setCountry: (country: Country) => void;
	formatCurrency: (amount: number) => string;
};

const CountryContext = createContext<CountryContextValue | null>(null);

const STORAGE_KEY = "paywatch-country";

const formatters: Record<Country, Intl.NumberFormat> = {
	US: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
	IN: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
};

export function CountryProvider({
	children,
	initialCountry,
}: {
	children: ReactNode;
	initialCountry?: Country;
}) {
	const [country, setCountryState] = useState<Country>(
		initialCountry ?? "US",
	);

	// Hydrate from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Country | null;
		if (stored === "US" || stored === "IN") {
			setCountryState(stored);
		} else if (initialCountry) {
			setCountryState(initialCountry);
		}
	}, [initialCountry]);

	const setCountry = useCallback((c: Country) => {
		setCountryState(c);
		localStorage.setItem(STORAGE_KEY, c);
	}, []);

	const formatCurrency = useCallback(
		(amount: number) => {
			return formatters[country].format(amount);
		},
		[country],
	);

	return (
		<CountryContext.Provider value={{ country, setCountry, formatCurrency }}>
			{children}
		</CountryContext.Provider>
	);
}

export function useCountry() {
	const ctx = useContext(CountryContext);
	if (!ctx) {
		throw new Error("useCountry must be used within a CountryProvider");
	}
	return ctx;
}
