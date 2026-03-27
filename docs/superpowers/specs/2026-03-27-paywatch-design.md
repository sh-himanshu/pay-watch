# PayWatch — Design Specification

**Date:** 2026-03-27
**Status:** Approved
**Author:** Himan (with AI assistance)

---

## 1. Overview

PayWatch is a consumer-grade web application that scans a user's email to surface upcoming bills, detect hidden fees, and alert them to price increases — before they result in missed payments or lost money.

**Target:** Personal project built to consumer-product standards as a portfolio piece.

**Core value proposition:** Connect Gmail once, and PayWatch automatically finds every bill, tracks due dates, and catches financial anomalies you'd otherwise miss.

---

## 2. Architecture

**Pattern:** Monolithic Next.js application deployed on Vercel.

```
┌─────────────────────────────────────────────────┐
│                    Vercel                        │
│  ┌───────────────────────────────────────────┐  │
│  │            Next.js App Router              │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │  Pages  │  │API Routes│  │Cron Jobs │ │  │
│  │  │(React)  │  │(handlers)│  │(polling) │ │  │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘ │  │
│  │       │             │             │        │  │
│  │  ┌────┴─────────────┴─────────────┴─────┐ │  │
│  │  │         Service Layer                 │ │  │
│  │  │  email-sync │ parser │ fee-detection  │ │  │
│  │  │  alerts     │ notifications           │ │  │
│  │  └──────────────────┬────────────────────┘ │  │
│  └─────────────────────┼─────────────────────┘  │
│                        │                         │
└────────────────────────┼─────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────┴────┐    ┌──────┴─────┐   ┌─────┴──────┐
   │Supabase │    │ Gmail API  │   │  External  │
   │Postgres │    │  (OAuth)   │   │  Services  │
   │  + Auth │    └────────────┘   │ Resend,    │
   │  + RLS  │                     │ web-push,  │
   └─────────┘                     │ OpenAI     │
                                   └────────────┘
```

### Key Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 16 (App Router) | Already in project; SSR + API routes in one deploy |
| Database | Supabase Postgres | Auth, RLS, real-time subscriptions, generous free tier |
| Auth | Supabase Auth (Google OAuth) | Handles Gmail OAuth flow; stores tokens securely |
| Email | Gmail API (read-only) | OAuth scopes restricted to `gmail.readonly` |
| Parsing | Rule-based + LLM fallback | Rules for known billers (fast, cheap); LLM for unknown formats |
| Notifications | Web Push (`web-push`), Email (Resend), In-app (Supabase real-time) | Multi-channel coverage by urgency |
| Cron | Vercel Cron | Triggers email polling every 15 minutes |
| Styling | Tailwind CSS v4 | Already in project |
| Linting | Biome | Already in project |

---

## 3. Data Model

Six tables with row-level security (RLS) on all tables scoped to `auth.uid()`.

### users

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches Supabase `auth.users.id` |
| email | text | From Google profile |
| display_name | text | From Google profile |
| avatar_url | text | From Google profile |
| created_at | timestamptz | Default `now()` |
| updated_at | timestamptz | Auto-updated via trigger |

### email_accounts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| provider | text | `'gmail'` (extensible) |
| email_address | text | The connected Gmail address |
| access_token | text | Encrypted at rest |
| refresh_token | text | Encrypted at rest |
| token_expires_at | timestamptz | For token refresh logic |
| last_synced_at | timestamptz | Tracks polling cursor |
| sync_status | text | `'active'` / `'error'` / `'disconnected'` |
| created_at | timestamptz | |

### billers

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| name | text | e.g., "Netflix", "Con Edison" |
| category | text | `'subscription'` / `'utility'` / `'credit_card'` / `'insurance'` / `'other'` |
| typical_amount | numeric(10,2) | Rolling average for anomaly detection |
| billing_frequency | text | `'monthly'` / `'quarterly'` / `'annual'` / `'irregular'` |
| first_seen_at | timestamptz | When first detected |
| created_at | timestamptz | |

### bills

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| biller_id | uuid (FK → billers) | |
| email_account_id | uuid (FK → email_accounts) | Which account detected it |
| amount | numeric(10,2) | Billed amount |
| due_date | date | Payment due date |
| status | text | `'upcoming'` (>3 days) / `'due_soon'` (<=3 days) / `'overdue'` (past due) / `'paid'` (manual or auto-detected). Transitions managed by the cron/reminders job. |
| source_email_id | text | Gmail message ID for traceability |
| source_email_subject | text | For display |
| source_email_date | timestamptz | When the email was received |
| parsed_by | text | `'rules'` / `'llm'` |
| confidence | numeric(3,2) | 0.00 – 1.00 parsing confidence |
| created_at | timestamptz | |

### alerts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| bill_id | uuid (FK → bills) | Nullable (new biller alerts have no bill) |
| biller_id | uuid (FK → billers) | |
| type | text | `'price_increase'` / `'unexpected_charge'` / `'new_biller'` |
| severity | text | `'urgent'` / `'warning'` / `'info'` |
| title | text | e.g., "Netflix price increased by 48%" |
| description | text | Detailed context |
| metadata | jsonb | Type-specific data (previous_amount, new_amount, percent_change, etc.) |
| is_read | boolean | Default `false` |
| is_dismissed | boolean | Default `false` |
| created_at | timestamptz | |

### notification_preferences

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | Unique constraint |
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

---

## 4. Email Parsing Pipeline

### Flow

```
Gmail API → Fetch unread messages since last_synced_at
   │
   ▼
Filter: subject/sender heuristics (keywords: "bill", "statement",
        "payment", "invoice", "due", "autopay", known biller domains)
   │
   ▼
For each candidate email:
   │
   ├─→ Match against known billers (sender domain + subject pattern)
   │     │
   │     ├─→ Match found → Rule-based extraction (regex on HTML/text body)
   │     │     → Extract: biller name, amount, due date
   │     │     → confidence: 0.90–1.00
   │     │
   │     └─→ No match → LLM extraction (structured output)
   │           → Prompt: "Extract biller, amount, due_date from this email"
   │           → confidence: 0.60–0.90
   │
   ▼
Validate extracted data (amount > 0, due_date is future or recent past)
   │
   ▼
Upsert bill record + update/create biller
   │
   ▼
Run fee detection engine on new bill
   │
   ▼
Update last_synced_at
```

### Rule-Based Parser

A registry of known biller patterns stored as configuration (not database):

```typescript
type BillerRule = {
  name: string;
  senderPatterns: string[];      // e.g., ["netflix.com", "info@netflix.com"]
  subjectPatterns: RegExp[];     // e.g., [/your .* statement/i]
  extractors: {
    amount: RegExp;              // Applied to email body
    dueDate: RegExp;
  };
};
```

Initial rules for common billers: Netflix, Spotify, Chase, Amex, Con Edison, AT&T, Verizon, AWS, Google Cloud, Adobe, etc. (~20 rules to start).

### LLM Fallback

- Provider: OpenAI (`gpt-4o-mini`) or Anthropic (`claude-3-haiku`) — cheapest model that handles structured extraction
- Input: Email body text (stripped HTML), truncated to 2000 tokens
- Output: JSON schema `{ biller: string, amount: number, due_date: string | null }`
- Rate limiting: Max 50 LLM calls per sync cycle per user
- Cost control: Only invoked when rule-based parser fails to match

---

## 5. Fee Detection Engine

Runs after each new bill is inserted. Three detection strategies:

### 5a. Price Increase Detection

```
Compare bill.amount against biller.typical_amount
If amount > typical_amount * 1.05 (5% threshold):
  → Create alert: type="price_increase", severity="warning"
  → metadata: { previous_amount, new_amount, percent_change }
  → If percent_change > 20%: severity="urgent"
```

After alert is created, update `biller.typical_amount` with a rolling average of the last 6 bills.

### 5b. Unexpected Charge Detection

```
For each new bill:
  Check if amount contains known fee keywords in source email:
    "late fee", "service charge", "convenience fee", "foreign transaction"
  OR if bill amount deviates > 2 standard deviations from biller history
  → Create alert: type="unexpected_charge", severity="warning"
  → metadata: { expected_range, actual_amount, reason }
```

### 5c. New Biller Detection

```
On biller upsert, if biller.first_seen_at == now():
  → Create alert: type="new_biller", severity="info"
  → metadata: { biller_name, first_amount, source_email }
```

---

## 6. Notification System

### Channels

| Channel | Trigger | Library |
|---------|---------|---------|
| **In-app** | All alerts | Supabase real-time subscriptions (Postgres changes on `alerts` table) |
| **Push** | Urgent alerts (`severity='urgent'`) + due reminders | `web-push` npm package (VAPID keys) |
| **Email digest** | Scheduled summary | Resend API (`resend` npm package) |

### Push Notifications

- Service worker registered on first login
- Subscription object stored in `notification_preferences.push_subscription`
- Sent via API route triggered by alert insertion (database webhook or trigger)
- Respects quiet hours: queue and deliver after `quiet_hours_end`

### Email Digest

- Vercel Cron job runs daily at 8:00 AM (or weekly, per user preference)
- Aggregates: upcoming bills this week, new alerts since last digest, overdue items
- Rendered with React Email components, sent via Resend

### Due Date Reminders

- Vercel Cron checks bills where `due_date - reminder_days_before = today`
- Generates push notification: "Chase Sapphire — $542.32 due in 3 days"

---

## 7. Pages & UI

Seven pages total. Dark theme throughout.

### Design System

- **Theme:** Dark Cinema — warm dark navy (`#09090f`) with ambient gradient glows, dot grid texture
- **Fonts:** Inter (UI text), JetBrains Mono (monetary values)
- **Icons:** Lucide-style SVG (inline, no emoji)
- **Accent:** `#5E6AD2` (indigo), with semantic colors: red (urgent), amber (warning), green (success), blue (info), purple (new)
- **Borders:** `rgba(255,255,255,0.06)` — subtle glass edges
- **Cards:** `#16161f` with 1px border, 12px radius
- **Breakpoints:** Desktop >1024px, Tablet <=1024px, Mobile <=640px

### Page Inventory

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Storytelling landing page — problem statement, product preview, features, trust section, CTA |
| Login | `/login` | Google OAuth sign-in with privacy explanation |
| Dashboard | `/dashboard` | Summary cards (due this week, overdue, monthly total, active alerts) + upcoming bills + recent alerts |
| Bills | `/dashboard/bills` | Full bill list with filters (status, biller, date range), sortable table |
| Alerts | `/dashboard/alerts` | Alert feed with colored severity bars, type icons, metadata, dismiss/mark-read actions |
| Billers | `/dashboard/billers` | Tracked biller list with category, typical amount, bill count, last billed date |
| Settings | `/dashboard/settings` | Notification preferences, connected accounts, quiet hours, account management |

### Layout

- **Dashboard shell:** Fixed 260px sidebar (desktop), hamburger overlay (mobile), with nav items: Dashboard, Bills, Alerts, Billers, Settings
- **Mobile:** Top bar with centered "PayWatch" brand, hamburger toggle for sidebar overlay
- **Landing page:** Full-width sections with ambient gradient backgrounds per section

---

## 8. Authentication Flow

1. User clicks "Sign in with Google" → Supabase Auth initiates Google OAuth
2. OAuth scopes requested: `openid`, `email`, `profile`, `gmail.readonly`
3. On callback: Supabase creates/updates user, stores tokens
4. App stores Gmail `access_token` and `refresh_token` in `email_accounts` table (encrypted)
5. Token refresh handled automatically before each sync cycle when `token_expires_at` is past

---

## 9. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sync` | POST | Trigger email sync for authenticated user |
| `/api/cron/sync-all` | GET | Vercel Cron — syncs all active email accounts |
| `/api/cron/digest` | GET | Vercel Cron — sends email digests |
| `/api/cron/reminders` | GET | Vercel Cron — sends due date reminders |
| `/api/push/subscribe` | POST | Save push subscription object |
| `/api/alerts/[id]/dismiss` | PATCH | Mark alert as dismissed |
| `/api/alerts/[id]/read` | PATCH | Mark alert as read |

All routes (except cron) require Supabase auth session. Cron routes are secured via `CRON_SECRET` header.

---

## 10. Error Handling

| Scenario | Handling |
|----------|----------|
| Gmail token expired | Auto-refresh via refresh_token; if refresh fails, mark `email_accounts.sync_status = 'error'`, show reconnect prompt in Settings |
| Gmail API rate limit | Exponential backoff with jitter; max 3 retries per sync |
| LLM parse failure | Log the email for manual review; skip bill creation; don't create false alerts |
| LLM timeout | 10-second timeout; fall back to skipping the email (will retry next sync) |
| Supabase downtime | API routes return 503; UI shows "service temporarily unavailable" |
| Push delivery failure | Silent fail; push is best-effort (email digest is the reliable backup) |
| Duplicate bill detection | Unique constraint on `(user_id, biller_id, source_email_id)` prevents duplicates |

---

## 11. Security Considerations

- **Gmail access:** Strictly `gmail.readonly` scope — cannot send, modify, or delete emails
- **Token storage:** OAuth tokens encrypted at rest in Supabase
- **Row-Level Security:** All tables enforce `user_id = auth.uid()` — users can only access their own data
- **CRON_SECRET:** Cron endpoints validate `Authorization: Bearer <CRON_SECRET>` header
- **VAPID keys:** Web Push VAPID keys stored as environment variables, never exposed to client
- **Email body:** Never stored in database; only extracted fields (amount, due date, biller name) are persisted
- **LLM calls:** Email body sent to LLM is truncated and stripped of PII beyond billing info

---

## 12. External Services & Environment Variables

| Service | Env Vars |
|---------|----------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| OpenAI (LLM fallback) | `OPENAI_API_KEY` |
| Resend (email) | `RESEND_API_KEY` |
| Web Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Cron auth | `CRON_SECRET` |

---

## 13. Out of Scope (for v1)

- Multi-provider email support (Outlook, Yahoo) — Gmail only for now
- Manual bill entry — auto-detection only
- Payment processing / bill pay — this is monitoring only
- Shared/family accounts
- Mobile native app — web-only (PWA possible later)
- Historical email backfill beyond 30 days on first connect
- Custom biller rules UI — rules are code-configured
