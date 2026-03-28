"use client";

import { Receipt, AlertTriangle, DollarSign, Bell } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useCountry } from "@/components/country-provider";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/animations";

type SummaryData = {
	dueThisWeek: number;
	overdue: number;
	monthlyTotal: number;
	activeAlerts: number;
};

function AnimatedValue({ value, formatFn }: { value: number; formatFn?: (n: number) => string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true });
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (!inView) return;
		const duration = 1200;
		const startTime = performance.now();
		function step(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setDisplay(eased * value);
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}, [inView, value]);

	return <span ref={ref}>{formatFn ? formatFn(display) : Math.round(display)}</span>;
}

export function SummaryCards({ data }: { data: SummaryData }) {
	const { formatCurrency } = useCountry();

	const cards = [
		{
			label: "Due This Week",
			rawValue: data.dueThisWeek,
			icon: Receipt,
			color: "text-info",
			bgColor: "bg-info-light",
		},
		{
			label: "Overdue",
			rawValue: data.overdue,
			icon: AlertTriangle,
			color: "text-urgent",
			bgColor: "bg-urgent-light",
		},
		{
			label: "Monthly Total",
			rawValue: data.monthlyTotal,
			icon: DollarSign,
			color: "text-success",
			bgColor: "bg-success-light",
			mono: true,
			isCurrency: true,
		},
		{
			label: "Active Alerts",
			rawValue: data.activeAlerts,
			icon: Bell,
			color: "text-warning",
			bgColor: "bg-warning-light",
		},
	];

	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
		>
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<motion.div
						key={card.label}
						variants={staggerItem}
						{...hoverLift}
						className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-muted">
								{card.label}
							</span>
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}
							>
								<Icon size={16} className={card.color} />
							</div>
						</div>
						<p
							className={`mt-3 text-3xl font-semibold ${card.mono ? "font-mono" : ""}`}
						>
							{card.isCurrency
								? <AnimatedValue value={card.rawValue} formatFn={formatCurrency} />
								: <AnimatedValue value={card.rawValue} />}
						</p>
					</motion.div>
				);
			})}
		</motion.div>
	);
}
