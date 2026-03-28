"use client";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<h2 className="text-xl font-bold text-urgent">Something went wrong</h2>
			<p className="max-w-md text-sm text-muted">
				{error.message || "An unexpected error occurred. Please try again."}
			</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
			>
				Try again
			</button>
		</div>
	);
}
