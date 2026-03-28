# PayWatch — Error Handling, Security & Environment

**Source:** `2026-03-27-paywatch-design.md` sections 10-13
**Status:** Approved

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Gmail token expired | Auto-refresh via refresh_token; if refresh fails, mark `email_accounts.sync_status = 'error'`, show reconnect prompt in Settings |
| Gmail API rate limit | Exponential backoff with jitter; max 3 retries per sync |
| LLM parse failure | Log the email for manual review; skip bill creation; don't create false alerts |
| LLM timeout | 10-second timeout; fall back to skipping the email (will retry next sync) |
| Supabase downtime | API routes return 503; UI shows "service temporarily unavailable" |
| Push delivery failure | Silent fail; push is best-effort (email digest is the reliable backup) |
| Duplicate bill detection | Unique constraint on `(user_id, biller_id, source_email_id)` prevents duplicates |

## Security Considerations

- **Gmail access:** Strictly `gmail.readonly` scope -- cannot send, modify, or delete emails
- **Token storage:** OAuth tokens encrypted at rest in Supabase
- **Row-Level Security:** All tables enforce `user_id = auth.uid()` -- users can only access their own data
- **CRON_SECRET:** Cron endpoints validate `Authorization: Bearer <CRON_SECRET>` header
- **VAPID keys:** Web Push VAPID keys stored as environment variables, never exposed to client
- **Email body:** Never stored in database; only extracted fields (amount, due date, biller name) are persisted
- **LLM calls:** Email body sent to LLM is truncated and stripped of PII beyond billing info

## External Services & Environment Variables

| Service | Env Vars |
|---------|----------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| OpenAI (LLM fallback) | `OPENAI_API_KEY` |
| Resend (email) | `RESEND_API_KEY` |
| Web Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Cron auth | `CRON_SECRET` |

## Out of Scope (for v1)

- Multi-provider email support (Outlook, Yahoo) -- Gmail only for now
- Manual bill entry -- auto-detection only
- Payment processing / bill pay -- this is monitoring only
- Shared/family accounts
- Mobile native app -- web-only (PWA possible later)
- Historical email backfill beyond 30 days on first connect
- Custom biller rules UI -- rules are code-configured
