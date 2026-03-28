import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { CountryProvider } from "@/components/country-provider";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PayWatch — Track Bills, Catch Hidden Fees",
	description:
		"Connect your Gmail and PayWatch automatically finds every bill, tracks due dates, and catches price increases before they cost you money.",
	appleWebApp: {
		title: "Pay Watch",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider>
					<CountryProvider>{children}</CountryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
