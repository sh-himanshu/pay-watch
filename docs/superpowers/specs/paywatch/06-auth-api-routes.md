# PayWatch — Authentication & API Routes

**Source:** `2026-03-27-paywatch-design.md` sections 8-9
**Status:** Approved

---

## Authentication Flow

1. User clicks "Sign in with Google" -> Supabase Auth initiates Google OAuth
2. OAuth scopes requested: `openid`, `email`, `profile`, `gmail.readonly`
3. On callback: Supabase creates/updates user, stores tokens
4. App stores Gmail `access_token` and `refresh_token` in `email_accounts` table (encrypted)
5. Token refresh handled automatically before each sync cycle when `token_expires_at` is past

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sync` | POST | Trigger email sync for authenticated user |
| `/api/cron/sync-all` | GET | Vercel Cron -- syncs all active email accounts |
| `/api/cron/digest` | GET | Vercel Cron -- sends email digests |
| `/api/cron/reminders` | GET | Vercel Cron -- sends due date reminders |
| `/api/push/subscribe` | POST | Save push subscription object |
| `/api/alerts/[id]/dismiss` | PATCH | Mark alert as dismissed |
| `/api/alerts/[id]/read` | PATCH | Mark alert as read |

All routes (except cron) require Supabase auth session. Cron routes are secured via `CRON_SECRET` header.
