# PayWatch — Data Model

**Source:** `2026-03-27-paywatch-design.md` section 3
**Status:** Approved

---

Six tables with row-level security (RLS) on all tables scoped to `auth.uid()`.

## users

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches Supabase `auth.users.id` |
| email | text | From Google profile |
| display_name | text | From Google profile |
| avatar_url | text | From Google profile |
| created_at | timestamptz | Default `now()` |
| updated_at | timestamptz | Auto-updated via trigger |

## email_accounts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK -> users) | |
| provider | text | `'gmail'` (extensible) |
| email_address | text | The connected Gmail address |
| access_token | text | Encrypted at rest |
| refresh_token | text | Encrypted at rest |
| token_expires_at | timestamptz | For token refresh logic |
| last_synced_at | timestamptz | Tracks polling cursor |
| sync_status | text | `'active'` / `'error'` / `'disconnected'` |
| created_at | timestamptz | |

## billers

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK -> users) | |
| name | text | e.g., "Netflix", "Con Edison" |
| category | text | `'subscription'` / `'utility'` / `'credit_card'` / `'insurance'` / `'other'` |
| typical_amount | numeric(10,2) | Rolling average for anomaly detection |
| billing_frequency | text | `'monthly'` / `'quarterly'` / `'annual'` / `'irregular'` |
| first_seen_at | timestamptz | When first detected |
| created_at | timestamptz | |

## bills

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK -> users) | |
| biller_id | uuid (FK -> billers) | |
| email_account_id | uuid (FK -> email_accounts) | Which account detected it |
| amount | numeric(10,2) | Billed amount |
| due_date | date | Payment due date |
| status | text | `'upcoming'` (>3 days) / `'due_soon'` (<=3 days) / `'overdue'` (past due) / `'paid'` (manual or auto-detected). Transitions managed by the cron/reminders job. |
| source_email_id | text | Gmail message ID for traceability |
| source_email_subject | text | For display |
| source_email_date | timestamptz | When the email was received |
| parsed_by | text | `'rules'` / `'llm'` |
| confidence | numeric(3,2) | 0.00 - 1.00 parsing confidence |
| created_at | timestamptz | |

## alerts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK -> users) | |
| bill_id | uuid (FK -> bills) | Nullable (new biller alerts have no bill) |
| biller_id | uuid (FK -> billers) | |
| type | text | `'price_increase'` / `'unexpected_charge'` / `'new_biller'` |
| severity | text | `'urgent'` / `'warning'` / `'info'` |
| title | text | e.g., "Netflix price increased by 48%" |
| description | text | Detailed context |
| metadata | jsonb | Type-specific data (previous_amount, new_amount, percent_change, etc.) |
| is_read | boolean | Default `false` |
| is_dismissed | boolean | Default `false` |
| created_at | timestamptz | |

## notification_preferences

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK -> users) | Unique constraint |
| push_enabled | boolean | Default `true` |
| push_subscription | jsonb | Web Push subscription object |
| email_digest_enabled | boolean | Default `true` |
| email_digest_frequency | text | `'daily'` / `'weekly'` |
| quiet_hours_start | time | e.g., `22:00` |
| quiet_hours_end | time | e.g., `08:00` |
| alert_price_increase | boolean | Default `true` |
| alert_unexpected_charge | boolean | Default `true` |
| alert_new_biller | boolean | Default `true` |
| alert_due_reminder | boolean | Default `true` |
| reminder_days_before | integer | Default `3` |
| created_at | timestamptz | |
