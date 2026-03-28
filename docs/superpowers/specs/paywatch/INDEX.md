# PayWatch — Spec Index

Split from `2026-03-27-paywatch-design.md` for incremental implementation.

---

## Spec Files

| # | File | Sections | Description |
|---|------|----------|-------------|
| 0 | [00-overview.md](./00-overview.md) | 1-2 | Project overview, architecture diagram, tech stack |
| 1 | [01-data-model.md](./01-data-model.md) | 3 | All 6 database tables with RLS |
| 2 | [02-email-parsing.md](./02-email-parsing.md) | 4 | Gmail sync flow, rule-based parser, LLM fallback |
| 3 | [03-fee-detection.md](./03-fee-detection.md) | 5 | Price increase, unexpected charge, new biller detection |
| 4 | [04-notifications.md](./04-notifications.md) | 6 | In-app, push, email digest, due date reminders |
| 5 | [05-ui-pages.md](./05-ui-pages.md) | 7 | Design system, 7 pages, layout spec |
| 6 | [06-auth-api-routes.md](./06-auth-api-routes.md) | 8-9 | Google OAuth flow, all API route definitions |
| 7 | [07-error-security-env.md](./07-error-security-env.md) | 10-13 | Error handling, security, env vars, out of scope |

---

## Recommended Implementation Order

### Phase 1: Foundation
1. **01-data-model.md** — Set up Supabase project, create all tables + RLS policies
2. **06-auth-api-routes.md** (Auth section only) — Google OAuth via Supabase Auth

### Phase 2: Core Backend
3. **02-email-parsing.md** — Gmail API integration, rule-based parser, LLM fallback
4. **03-fee-detection.md** — Alert generation on bill insert
5. **06-auth-api-routes.md** (API routes) — `/api/sync`, cron jobs, alert endpoints

### Phase 3: UI
6. **05-ui-pages.md** — Landing page, login, dashboard shell, all dashboard pages
7. **04-notifications.md** — In-app alerts (real-time), push notifications, email digest

### Phase 4: Hardening
8. **07-error-security-env.md** — Error handling, security review, env var setup
