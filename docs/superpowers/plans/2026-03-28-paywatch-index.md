# PayWatch — Master Implementation Plan

> **For agentic workers:** Each phase below is a separate plan file. Execute them in order. Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans per phase.

**Goal:** Build PayWatch — a Gmail-connected bill tracker that detects fees, price increases, and upcoming due dates.

**Architecture:** Monolithic Next.js 16 App Router on Vercel, Supabase Postgres for data + auth + RLS, Gmail API for email reading, rule-based + LLM parsing, multi-channel notifications (in-app, push, email digest).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth + RLS + Realtime), Gmail API, OpenAI, Resend, web-push, Biome, pnpm

---

## Current State

Bare `create-next-app` scaffold. No custom code, no dependencies beyond Next.js/React/Tailwind/Biome.

## Phase Plans (execute in order)

| Phase | Plan File | What It Builds | Spec References |
|-------|-----------|----------------|-----------------|
| 1 | [phase1-foundation.md](./2026-03-28-paywatch-phase1-foundation.md) | Dependencies, env vars, Supabase clients, DB schema + RLS, Google OAuth auth flow | `01-data-model.md`, `06-auth-api-routes.md` (auth section) |
| 2 | [phase2-backend.md](./2026-03-28-paywatch-phase2-backend.md) | Biller rules, email filter, rule parser, LLM parser, email sync orchestrator, fee detection, API routes + cron | `02-email-parsing.md`, `03-fee-detection.md`, `06-auth-api-routes.md` (routes section) |
| 3 | [phase3-ui.md](./2026-03-28-paywatch-phase3-ui.md) | Design system tokens, dashboard layout shell, landing page, login page, dashboard home, bills, alerts, billers, settings pages | `05-ui-pages.md` |
| 4 | [phase4-notifications.md](./2026-03-28-paywatch-phase4-notifications.md) | In-app real-time alerts, push notifications + service worker, email digest, due date reminders, error handling hardening | `04-notifications.md`, `07-error-security-env.md` |

## Dependency Graph

```
Phase 1 (Foundation)
  └─> Phase 2 (Backend)
  └─> Phase 3 (UI)
        └─> Phase 4 (Notifications)
```

Phase 2 and Phase 3 can run in parallel after Phase 1 completes. Phase 4 depends on both Phase 2 and Phase 3.

## Full File Structure

```
pay-watch/
├── app/
│   ├── globals.css                          # MODIFY: PayWatch design tokens
│   ├── layout.tsx                           # MODIFY: Fonts, metadata, Supabase provider
│   ├── page.tsx                             # MODIFY: Landing page
│   ├── login/page.tsx                       # CREATE
│   ├── auth/callback/route.ts               # CREATE
│   ├── dashboard/
│   │   ├── layout.tsx                       # CREATE: Sidebar shell
│   │   ├── page.tsx                         # CREATE: Dashboard home
│   │   ├── bills/page.tsx                   # CREATE
│   │   ├── alerts/page.tsx                  # CREATE
│   │   ├── billers/page.tsx                 # CREATE
│   │   └── settings/page.tsx                # CREATE
│   └── api/
│       ├── sync/route.ts                    # CREATE
│       ├── cron/sync-all/route.ts           # CREATE
│       ├── cron/digest/route.ts             # CREATE
│       ├── cron/reminders/route.ts          # CREATE
│       ├── push/subscribe/route.ts          # CREATE
│       └── alerts/[id]/
│           ├── dismiss/route.ts             # CREATE
│           └── read/route.ts                # CREATE
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # CREATE: Browser client
│   │   ├── server.ts                        # CREATE: Server client
│   │   └── admin.ts                         # CREATE: Service-role client (cron)
│   ├── services/
│   │   ├── email-sync.ts                    # CREATE: Gmail sync orchestrator
│   │   ├── email-filter.ts                  # CREATE: Subject/sender heuristics
│   │   ├── parser-rules.ts                  # CREATE: Rule-based parser
│   │   ├── parser-llm.ts                    # CREATE: LLM fallback parser
│   │   ├── fee-detection.ts                 # CREATE: Fee detection engine
│   │   ├── notifications.ts                 # CREATE: Notification dispatcher
│   │   └── push.ts                          # CREATE: Web push sender
│   ├── biller-rules.ts                      # CREATE: Known biller pattern registry
│   └── types.ts                             # CREATE: Shared TypeScript types
├── components/
│   ├── landing/                             # CREATE: Landing page sections
│   ├── dashboard/                           # CREATE: Dashboard widgets
│   ├── bills/                               # CREATE: Bills table
│   ├── alerts/                              # CREATE: Alert feed
│   ├── billers/                             # CREATE: Biller list
│   └── settings/                            # CREATE: Settings forms
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql           # CREATE: Full DB migration
├── middleware.ts                             # CREATE: Auth session refresh
├── public/sw.js                             # CREATE: Service worker (push)
├── vercel.json                              # CREATE: Cron schedule
├── .env.local.example                       # CREATE: Env var template
└── vitest.config.ts                         # CREATE: Test config
```

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth (configured in Supabase dashboard)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenAI (LLM fallback parser)
OPENAI_API_KEY=

# Resend (email digest)
RESEND_API_KEY=

# Web Push (VAPID keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Cron security
CRON_SECRET=
```
