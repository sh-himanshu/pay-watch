import type { Variants, Transition } from "motion/react";

// --- Shared spring configs ---
export const springSmooth: Transition = {
	type: "spring",
	stiffness: 100,
	damping: 15,
};

export const springBouncy: Transition = {
	type: "spring",
	stiffness: 260,
	damping: 20,
};

export const springGentle: Transition = {
	type: "spring",
	stiffness: 80,
	damping: 20,
};

// --- Reusable variants ---

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
};

export const fadeInDown: Variants = {
	hidden: { opacity: 0, y: -20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
	},
};

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 60 },
	visible: {
		opacity: 1,
		x: 0,
		transition: springSmooth,
	},
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -40 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
	},
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.85 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: springSmooth,
	},
};

export const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

export const staggerContainerFast: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.05,
		},
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
	},
};

export const staggerItemLeft: Variants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
	},
};

// --- Hover / Tap interactions ---

export const hoverLift = {
	whileHover: { y: -4, scale: 1.02, transition: springBouncy },
	whileTap: { scale: 0.98 },
};

export const hoverScale = {
	whileHover: { scale: 1.05, transition: springBouncy },
	whileTap: { scale: 0.95 },
};

// --- SVG path draw ---

export const drawPath: Variants = {
	hidden: { pathLength: 0, opacity: 0 },
	visible: {
		pathLength: 1,
		opacity: 1,
		transition: { duration: 1, ease: "easeInOut" },
	},
};

// --- Page transition ---

export const pageTransition: Variants = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
	},
	exit: {
		opacity: 0,
		y: -8,
		transition: { duration: 0.2 },
	},
};

// --- Section reveal (for whileInView) ---

export const sectionReveal = {
	initial: "hidden" as const,
	whileInView: "visible" as const,
	viewport: { once: true, margin: "-80px" },
	variants: fadeInUp,
};

export const sectionRevealStagger = {
	initial: "hidden" as const,
	whileInView: "visible" as const,
	viewport: { once: true, margin: "-80px" },
	variants: staggerContainer,
};
