# PayWatch — Overview & Architecture

**Source:** `2026-03-27-paywatch-design.md` sections 1-2
**Status:** Approved

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
