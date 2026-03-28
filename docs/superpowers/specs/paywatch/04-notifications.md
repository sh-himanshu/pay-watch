# PayWatch — Notification System

**Source:** `2026-03-27-paywatch-design.md` section 6
**Status:** Approved

---

## Channels

| Channel | Trigger | Library |
|---------|---------|---------|
| **In-app** | All alerts | Supabase real-time subscriptions (Postgres changes on `alerts` table) |
| **Push** | Urgent alerts (`severity='urgent'`) + due reminders | `web-push` npm package (VAPID keys) |
| **Email digest** | Scheduled summary | Resend API (`resend` npm package) |

## Push Notifications

- Service worker registered on first login
- Subscription object stored in `notification_preferences.push_subscription`
- Sent via API route triggered by alert insertion (database webhook or trigger)
- Respects quiet hours: queue and deliver after `quiet_hours_end`

## Email Digest

- Vercel Cron job runs daily at 8:00 AM (or weekly, per user preference)
- Aggregates: upcoming bills this week, new alerts since last digest, overdue items
- Rendered with React Email components, sent via Resend

## Due Date Reminders

- Vercel Cron checks bills where `due_date - reminder_days_before = today`
- Generates push notification: "Chase Sapphire -- $542.32 due in 3 days"
