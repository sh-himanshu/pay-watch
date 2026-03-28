export type Country = "US" | "IN";

export type User = {
	id: string;
	email: string;
	display_name: string;
	avatar_url: string | null;
	country: Country;
	created_at: string;
	updated_at: string;
};

export type EmailAccount = {
	id: string;
	user_id: string;
	provider: "gmail";
	email_address: string;
	access_token: string;
	refresh_token: string;
	token_expires_at: string;
	last_synced_at: string | null;
	sync_status: "active" | "error" | "disconnected";
	created_at: string;
};

export type BillerCategory =
	| "subscription"
	| "utility"
	| "credit_card"
	| "insurance"
	| "other";

export type Biller = {
	id: string;
	user_id: string;
	name: string;
	category: BillerCategory;
	typical_amount: number | null;
	billing_frequency: "monthly" | "quarterly" | "annual" | "irregular";
	first_seen_at: string;
	created_at: string;
};

export type BillStatus = "upcoming" | "due_soon" | "overdue" | "paid";

export type Bill = {
	id: string;
	user_id: string;
	biller_id: string;
	email_account_id: string;
	amount: number;
	due_date: string;
	status: BillStatus;
	source_email_id: string;
	source_email_subject: string;
	source_email_date: string;
	parsed_by: "rules" | "llm";
	confidence: number;
	created_at: string;
};

export type AlertType =
	| "price_increase"
	| "unexpected_charge"
	| "new_biller";

export type AlertSeverity = "urgent" | "warning" | "info";

export type Alert = {
	id: string;
	user_id: string;
	bill_id: string | null;
	biller_id: string;
	type: AlertType;
	severity: AlertSeverity;
	title: string;
	description: string;
	metadata: Record<string, unknown>;
	is_read: boolean;
	is_dismissed: boolean;
	created_at: string;
};

export type NotificationPreferences = {
	id: string;
	user_id: string;
	push_enabled: boolean;
	push_subscription: Record<string, unknown> | null;
	email_digest_enabled: boolean;
	email_digest_frequency: "daily" | "weekly";
	quiet_hours_start: string | null;
	quiet_hours_end: string | null;
	alert_price_increase: boolean;
	alert_unexpected_charge: boolean;
	alert_new_biller: boolean;
	alert_due_reminder: boolean;
	reminder_days_before: number;
	created_at: string;
};
