# Phase 1 — Public Website
## Modules: Landing Website · Registration Flow · User Dashboard
**Sprint:** 3 | **Priority:** ⭐⭐⭐⭐

---

## Overview

Phase 1 converts the existing HTML prototype into a React application and adds the onboarding registration flow. The goal is a fully working public-facing website where a new broker can discover COBROKINGS, register their company, and land on their dashboard.

**Input:** Completed Phase 0 (auth system, project setup)  
**Output:** Deployed public website + registration wizard + dashboard shell

---

## Module 4 — Landing Website

### Current State
The landing page already exists as `index.html` with sections: Hero, Stats, Area Circles, How It Works, Categories, Testimonials, CTA, Footer.

### Tasks — Convert Prototype to React

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 4.1 | Convert `index.html` → `pages/Home.tsx` | 4h | Phase 0 |
| 4.2 | Convert `auth.html` → auth pages (done in Phase 0) | — | Phase 0 |
| 4.3 | Convert `marketplace.html` → `pages/Marketplace.tsx` skeleton | 2h | Phase 0 |
| 4.4 | Extract Navbar into `components/layout/Navbar.tsx` | 2h | 4.1 |
| 4.5 | Extract Footer into `components/layout/Footer.tsx` | 1h | 4.1 |
| 4.6 | Build Hero section component | 2h | 4.1 |
| 4.7 | Build Stats section component | 1h | 4.1 |
| 4.8 | Build Area Circles section component | 2h | 4.1 |
| 4.9 | Build How It Works section component | 1h | 4.1 |
| 4.10 | Build Testimonials section component | 1h | 4.1 |
| 4.11 | Build Pricing section component | 2h | 4.1 |
| 4.12 | Build FAQ section component (accordion) | 1h | 4.1 |
| 4.13 | Build CTA / Banner section | 1h | 4.1 |
| 4.14 | Create About page (`/about`) | 2h | 4.4 |
| 4.15 | Create Features page (`/features`) | 2h | 4.4 |
| 4.16 | Create Contact page (`/contact`) with form | 2h | 4.4 |
| 4.17 | Create Blog list page (`/blog`) | 2h | 4.4 |
| 4.18 | Create Blog detail page (`/blog/:slug`) | 2h | 4.17 |
| 4.19 | SEO — meta tags, og:image, sitemap | 2h | 4.1 |
| 4.20 | Mobile responsiveness audit + fixes | 3h | 4.1 |
| 4.21 | Animations (Framer Motion) — hero, section entrances | 2h | 4.1 |
| 4.22 | Dark/light mode toggle (optional) | 2h | 4.1 |

### Pages

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | Convert from prototype |
| About | `/about` | New |
| Features | `/features` | New |
| Pricing | `/pricing` | New |
| FAQ | `/faq` | New |
| Contact | `/contact` | New |
| Blog List | `/blog` | New |
| Blog Detail | `/blog/:slug` | New |
| Terms | `/terms` | New |
| Privacy | `/privacy` | New |

### SEO Requirements

```html
<!-- Every page must have: -->
<title>Page Title — COBROKINGS</title>
<meta name="description" content="..." />
<meta property="og:title" content="..." />
<meta property="og:image" content="..." />
<link rel="canonical" href="..." />
```

### Acceptance Criteria
- [ ] All prototype sections converted to React components
- [ ] Lighthouse score > 85 on mobile and desktop
- [ ] No broken links
- [ ] All pages are responsive (320px–1920px)
- [ ] Contact form submits successfully (email delivered)
- [ ] Animations don't cause layout shift (CLS < 0.1)

---

## Module 5 — Registration Flow

### Flow Overview

```
Step 1 — Account Details
  Email, Phone, Full Name, Password

        ↓

Step 2 — Company Information  
  Company Name, Type, City, State, Address, Website

        ↓

Step 3 — KYC Documents
  RERA Certificate, GST Certificate, PAN Card

        ↓

Step 4 — Business Details
  Years in Business, No. of Brokers, Specialisation, Areas Served

        ↓

Step 5 — Review & Submit
  Preview all info → Submit for approval

        ↓

Email Verification OTP

        ↓

Approval Pending Screen
  "Our team will verify your documents within 24–48 hours"

        ↓

Verified → Dashboard
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 5.1 | Registration wizard UI shell (5 steps, progress bar) | 3h | Phase 0 |
| 5.2 | Step 1 — Account Details form + validation | 2h | 5.1 |
| 5.3 | Step 2 — Company Information form | 2h | 5.1 |
| 5.4 | Step 3 — KYC Documents upload | 3h | 5.1 |
| 5.5 | Step 4 — Business Details form | 2h | 5.1 |
| 5.6 | Step 5 — Review & Submit screen | 2h | 5.1 |
| 5.7 | Wizard state management (persist across steps) | 2h | 5.2 |
| 5.8 | API — POST /api/companies (create company profile) | 3h | Phase 0 |
| 5.9 | API — POST /api/companies/:id/verify (submit docs) | 2h | 5.8 |
| 5.10 | File upload to Supabase Storage (KYC docs) | 2h | 5.4 |
| 5.11 | Email verification OTP screen | 1h | Phase 0 |
| 5.12 | "Pending Approval" holding screen | 1h | 5.6 |
| 5.13 | Admin notification on new company registration | 1h | 5.8 |
| 5.14 | Write registration E2E test | 3h | 5.6 |

### Form Validations

```typescript
// Step 1
email: valid email format, unique
phone: Indian mobile (10 digits, starts with 6–9)
password: min 8 chars, 1 uppercase, 1 number, 1 special char
fullName: min 2 chars, max 100 chars

// Step 2
companyName: required, min 2 chars
companyType: enum [pvt_ltd, partnership, sole_proprietor, llp]
city: required
state: required

// Step 3
reraDoc: required, PDF/JPG only, max 5MB
gstDoc: optional, PDF/JPG only, max 5MB
panDoc: required, PDF/JPG only, max 5MB
```

### Acceptance Criteria
- [ ] User cannot skip steps (step 3+ requires step 2 data)
- [ ] Wizard state persists if user navigates back
- [ ] Documents upload with progress indicator
- [ ] Validation errors shown inline per field
- [ ] On submit — confirmation email sent within 60s
- [ ] "Pending Approval" screen shows after email verification

---

## Module 6 — User Dashboard (Shell)

> **Note:** Full dashboard features are built in later phases. This module creates the shell and navigation structure only.

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR  (Logo, Search, Notifications, User Avatar)      │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │           MAIN CONTENT AREA                  │
│          │                                               │
│ Dashboard│  Welcome back, [Name]                         │
│ Mandates │                                               │
│ Deals    │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ Chat     │  │ Mandates │ │  Deals   │ │  Intros  │     │
│ Members  │  │    12    │ │    5     │ │    3     │     │
│ CRM      │  └──────────┘ └──────────┘ └──────────┘     │
│ Reports  │                                               │
│ Settings │  Recent Activity Feed                         │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 6.1 | Dashboard layout component (sidebar + topbar) | 3h | Phase 0 |
| 6.2 | Responsive sidebar (collapsible on mobile) | 2h | 6.1 |
| 6.3 | Dashboard home — stat cards (mandates, deals, intros) | 2h | 6.1 |
| 6.4 | Recent activity feed placeholder | 1h | 6.1 |
| 6.5 | User avatar menu (profile, settings, logout) | 1h | 6.1 |
| 6.6 | Notification bell with unread count | 1h | 6.1 |
| 6.7 | Global search bar (placeholder for Phase 3) | 1h | 6.1 |
| 6.8 | Breadcrumb navigation component | 1h | 6.1 |
| 6.9 | "Verification pending" banner for unverified companies | 1h | 6.1 |
| 6.10 | Dark mode support (Shadcn + Tailwind) | 2h | 6.1 |

### Acceptance Criteria
- [ ] Dashboard loads within 2 seconds after login
- [ ] Sidebar collapses on mobile (hamburger menu)
- [ ] Unverified companies see the verification banner
- [ ] All sidebar navigation links work (even if pages are empty)
- [ ] Logout from avatar menu clears session and redirects to login
