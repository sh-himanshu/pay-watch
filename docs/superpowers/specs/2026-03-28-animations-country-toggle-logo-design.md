# PayWatch: Animations, Country Toggle, Login Logo & Core Verification

**Date**: 2026-03-28
**Status**: Approved

## Overview

Five enhancements to the PayWatch app:

1. **Motion animations** across the entire app using the already-installed `motion` v12.38.0
2. **Country toggle** (US / India) with data-aware persistence, currency formatting, and text localization
3. **Login screen logo** — prominent animated shield logo with tagline
4. **Core features verification** via Chrome DevTools MCP (email sync, bill parsing, alerts)

## 1. Country/Currency System

### Approach

Context-based country system with Supabase user preference persistence. Display-layer formatting only — bill amounts in the DB remain unchanged.

### Data Layer

- Add a `country` column (`text`, values `'US'` or `'IN'`, default `'US'`) to the `public.users` table in Supabase (migration file: `supabase/migrations/001_initial_schema.sql`)
- Update the `User` type in `lib/types.ts` to include `country: 'US' | 'IN'`
- Update the `handle_new_user()` trigger to default `country` to `'US'` on signup
- For the landing page (pre-auth), store preference in `localStorage` under key `paywatch-country`

### React Context (`CountryProvider`)

Create `components/country-provider.tsx`:

```typescript
type Country = 'US' | 'IN';

interface CountryContextValue {
  country: Country;
  setCountry: (country: Country) => void;
  formatCurrency: (amount: number) => string;
}
```

- `formatCurrency` uses `Intl.NumberFormat`:
  - US: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
  - IN: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- On `setCountry`: updates context state, persists to Supabase (if logged in) or `localStorage` (if not)
- On mount: reads from Supabase user preference (dashboard) or `localStorage` (landing page)

### Country Toggle Component

Create `components/country-toggle.tsx`:

- Small toggle with flag icons (US flag emoji / India flag emoji)
- Two placements:
  1. Landing page navbar (next to "Get Started" CTA)
  2. Dashboard header (next to theme toggle)
- On toggle: calls `setCountry()` from context

### Content Affected

**Landing page:**
- Hero badge: "The average **American**/**Indian** loses **$512**/**₹42,000**/year to hidden fees"
- All hardcoded mockup dollar values swap to INR equivalents
- Maintain a small mapping of US→IN content variants for the ~10 hardcoded values on the page

**Dashboard (all pages):**
- `SummaryCards`: monthly total formatted via `formatCurrency()`
- `UpcomingBills`: bill amounts formatted via `formatCurrency()`
- `RecentAlerts`: any amounts in alert descriptions
- `/dashboard/bills`: bill amount column
- `/dashboard/billers`: typical amount display

All formatting currently using `$${value.toFixed(2)}` will be replaced with `formatCurrency(value)`.

## 2. Motion Animations

### Shared Animation Config

Create `lib/animations.ts` with reusable motion variants:

- `fadeInUp` — fade in while translating up (for section reveals)
- `fadeIn` — simple opacity fade
- `staggerContainer` — parent variant that staggers children
- `staggerItem` — child variant for staggered lists
- `springHover` — scale with spring physics on hover
- `slideInRight` — slide in from right (for alerts)
- `scaleIn` — scale up from center (for modals/cards)
- `drawPath` — SVG path draw animation (for logo)

Consistent config: `spring` type with `stiffness: 100, damping: 15` for interactive elements; `tween` with `duration: 0.6` for reveals.

### Landing Page (Expressive)

| Element | Animation |
|---------|-----------|
| Hero headline | Slide up + fade in on mount |
| Hero subtext | Slide up + fade in, 150ms stagger delay |
| Hero CTA buttons | Spring in from below, 300ms stagger |
| Dashboard preview image | Subtle parallax on scroll (translateY based on scroll progress) |
| Problem stats ($512, 73%, etc.) | Count up from 0 when scrolled into view |
| Section headings | Fade + slide up on `whileInView` |
| Feature cards grid | Staggered fade-in-up, 100ms between cards |
| How It Works steps | Sequential reveal left-to-right |
| Smart Alerts mockup | Slide in from right with spring |
| All cards | Spring-based lift on hover (`whileHover: { y: -4, scale: 1.02 }`) |

### Dashboard (Polished)

| Element | Animation |
|---------|-----------|
| Page content | Fade in on route change via `AnimatePresence` |
| Summary cards | Staggered mount, 100ms between cards |
| Summary card numbers | Count up from 0 to value on mount |
| Upcoming bills list | Items stagger in from left, 50ms between |
| Recent alerts list | Items stagger in from left, 50ms between |
| Sidebar active indicator | `layoutId` animated indicator slides between items |
| Realtime alert toast | Spring slide-in from right, slide-out on dismiss |

### Login Screen

| Element | Animation |
|---------|-----------|
| Shield icon | SVG path draw animation (1s) |
| Icon container | Fade in with glow pulse after draw completes |
| "PayWatch" text | Fade in, 200ms after icon |
| Tagline | Fade in, 400ms after icon |
| Login card | Scale up from center with spring, 600ms after icon |

## 3. Login Screen Logo

### Current State

The login page (`app/login/page.tsx`) shows only "PayWatch" as plain text with no icon or visual treatment.

### Design

- **Shield icon**: Large (80x80px) shield from Lucide, placed inside a rounded container with gradient background (`indigo-500` → `blue-600`) and ambient glow (`box-shadow: 0 0 40px rgba(99, 102, 241, 0.3)`)
- **App name**: "Pay" in foreground color + "Watch" in accent color, 32px font weight 700
- **Tagline**: "Your bills, watched and protected" in muted color, 14px
- **Card treatment**: Glassmorphism — `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(10px)`, subtle border
- **Animation**: Sequential entrance as described in Section 2

### Placement

Centered vertically and horizontally on the page. Logo above the login card, not inside it.

## 4. Core Features Verification

After implementation, use Chrome DevTools MCP to verify these flows:

### Email Sync
- Navigate to `/dashboard/settings`
- Trigger the `syncEmails` server action
- Verify network requests to Gmail API complete (check Network tab)
- Confirm bills appear in `/dashboard/bills` after sync

### Bill Parsing
- Inspect rendered bills in `/dashboard/bills`
- Verify parsed fields: biller name, amount, due date, status, confidence
- Check console for LLM parsing errors or warnings

### Alerts
- Navigate to `/dashboard/alerts`, verify alert list renders with correct data
- Confirm realtime Supabase channel subscription is active
- Save notification preferences in settings, verify form submission succeeds
- Check alert severity colors and type icons render correctly

### Cross-cutting
- Toggle country US → IN on all pages, verify currency formatting updates
- Verify animations don't break functional click/submit interactions
- Test dark mode + country toggle combination renders correctly
- Verify all animations respect `prefers-reduced-motion` media query

## Files to Create

| File | Purpose |
|------|---------|
| `components/country-provider.tsx` | Country context provider |
| `components/country-toggle.tsx` | US/India toggle component |
| `lib/animations.ts` | Shared motion variants and config |

## Files to Modify

| File | Changes |
|------|---------|
| `app/layout.tsx` | Wrap with `CountryProvider` |
| `app/page.tsx` | Add animations, country-aware content, toggle in nav |
| `app/login/page.tsx` | Add logo, animated entrance |
| `app/dashboard/layout.tsx` | Add country toggle to header |
| `app/dashboard/page.tsx` | Animate summary cards, lists |
| `components/dashboard/header.tsx` | Add country toggle |
| `components/dashboard/sidebar.tsx` | Animated active indicator |
| `components/dashboard/summary-cards.tsx` | `formatCurrency()`, count-up animation |
| `components/dashboard/upcoming-bills.tsx` | `formatCurrency()`, stagger animation |
| `components/dashboard/recent-alerts.tsx` | `formatCurrency()`, stagger animation |
| `app/dashboard/bills/page.tsx` | `formatCurrency()` |
| `app/dashboard/billers/page.tsx` | `formatCurrency()` |
| `app/globals.css` | Any additional animation utility styles |

## Out of Scope

- Currency conversion (exchange rates) — amounts display as-is in the selected currency
- Languages beyond English — only specific text swaps (American→Indian, $→₹)
- Auth flow testing — excluded per user request
- Additional countries beyond US and India
