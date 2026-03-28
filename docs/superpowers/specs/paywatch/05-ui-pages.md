# PayWatch — Pages & UI

**Source:** `2026-03-27-paywatch-design.md` section 7
**Status:** Approved

---

Seven pages total. Dark theme throughout.

## Design System

- **Theme:** Dark Cinema -- warm dark navy (`#09090f`) with ambient gradient glows, dot grid texture
- **Fonts:** Inter (UI text), JetBrains Mono (monetary values)
- **Icons:** Lucide-style SVG (inline, no emoji)
- **Accent:** `#5E6AD2` (indigo), with semantic colors: red (urgent), amber (warning), green (success), blue (info), purple (new)
- **Borders:** `rgba(255,255,255,0.06)` -- subtle glass edges
- **Cards:** `#16161f` with 1px border, 12px radius
- **Breakpoints:** Desktop >1024px, Tablet <=1024px, Mobile <=640px

## Page Inventory

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Storytelling landing page -- problem statement, product preview, features, trust section, CTA |
| Login | `/login` | Google OAuth sign-in with privacy explanation |
| Dashboard | `/dashboard` | Summary cards (due this week, overdue, monthly total, active alerts) + upcoming bills + recent alerts |
| Bills | `/dashboard/bills` | Full bill list with filters (status, biller, date range), sortable table |
| Alerts | `/dashboard/alerts` | Alert feed with colored severity bars, type icons, metadata, dismiss/mark-read actions |
| Billers | `/dashboard/billers` | Tracked biller list with category, typical amount, bill count, last billed date |
| Settings | `/dashboard/settings` | Notification preferences, connected accounts, quiet hours, account management |

## Layout

- **Dashboard shell:** Fixed 260px sidebar (desktop), hamburger overlay (mobile), with nav items: Dashboard, Bills, Alerts, Billers, Settings
- **Mobile:** Top bar with centered "PayWatch" brand, hamburger toggle for sidebar overlay
- **Landing page:** Full-width sections with ambient gradient backgrounds per section
