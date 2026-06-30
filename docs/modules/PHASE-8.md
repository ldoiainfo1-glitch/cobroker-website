# Phase 8 — Admin Panel
## Modules: Admin Dashboard · CMS · Settings & Configuration
**Sprints:** 18 | **Priority:** ⭐⭐⭐⭐⭐

---

## Overview

Phase 8 gives the COBROKINGS internal team full platform control. The admin panel manages users, companies, mandates, payments, and all platform content. It is only accessible to `super_admin` role.

**Input:** Completed Phases 0–7  
**Output:** Full internal admin panel with moderation, CMS, and configuration

---

## Module 25 — Admin Dashboard

### Overview Stats

```
┌──────────────────────────────────────────────────────────┐
│  COBROKINGS Admin                          👤 Super Admin │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Users   │ │Companies │ │Mandates  │ │  MRR     │   │
│  │  14,240  │ │  3,120   │ │  48,000  │ │ ₹12.4L   │   │
│  │ ↑ 12%    │ │ ↑ 8%     │ │ ↑ 22%    │ │ ↑ 18%    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  [User Growth Chart]        [Revenue Chart]              │
│                                                          │
│  Pending Verifications (12)        [Review →]            │
│  Reported Content (3)              [Review →]            │
│  Support Tickets (7)               [Review →]            │
└──────────────────────────────────────────────────────────┘
```

### Admin Navigation

```
Admin Panel
├── Dashboard (overview stats)
├── Users
│   ├── All Users
│   ├── Pending Approval
│   └── Banned Users
├── Companies
│   ├── All Companies
│   ├── Pending Verification
│   └── Verified
├── Mandates
│   ├── All Mandates
│   ├── Reported
│   └── Expired
├── Deals
│   └── All Deals
├── Payments
│   ├── All Transactions
│   ├── Subscriptions
│   └── Failed Payments
├── CMS
│   ├── Homepage
│   ├── Blog
│   ├── FAQ
│   ├── Pricing
│   └── Banners
└── Settings
    ├── Roles & Permissions
    ├── Email Templates
    ├── SMS Templates
    ├── Notification Rules
    └── Platform Config
```

### Tasks — Admin Dashboard

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 25.1 | Admin layout (separate from broker dashboard) | 3h | Phase 1 |
| 25.2 | Admin dashboard — stats cards | 2h | 25.1 |
| 25.3 | Admin dashboard — charts (users, revenue) | 3h | 25.1 |
| 25.4 | Pending actions queue (verifications, reports) | 2h | 25.1 |
| 25.5 | Admin route guard (super_admin only) | 1h | Phase 0 |

### Tasks — User Management

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 25.6 | Users table (paginated, searchable) | 3h | 25.1 |
| 25.7 | User detail view (profile, activity, deals) | 3h | 25.6 |
| 25.8 | Activate / deactivate user | 1h | 25.6 |
| 25.9 | Change user role | 1h | 25.6 |
| 25.10 | Force logout user (invalidate all sessions) | 1h | 25.6 |
| 25.11 | Impersonate user (view as user, read-only) | 3h | 25.6 |
| 25.12 | Delete user (with confirmation) | 1h | 25.6 |

### Tasks — Company Management

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 25.13 | Companies table (paginated, filterable) | 2h | 25.1 |
| 25.14 | Verification review queue | 3h | 25.13 |
| 25.15 | View uploaded KYC documents | 2h | 25.14 |
| 25.16 | Approve company verification | 1h | 25.14 |
| 25.17 | Reject verification with reason | 1h | 25.14 |
| 25.18 | Suspend company | 1h | 25.13 |

### Tasks — Mandate Management

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 25.19 | Mandates table (all statuses) | 2h | 25.1 |
| 25.20 | Reported mandate review | 2h | 25.19 |
| 25.21 | Remove / hide mandate | 1h | 25.19 |
| 25.22 | Boost mandate to top of feed (featured) | 2h | 25.19 |

### Tasks — Payments

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 25.23 | Payments table (all transactions) | 2h | Phase 6 |
| 25.24 | Subscriptions table | 1h | Phase 6 |
| 25.25 | Manual refund initiation (via Razorpay dashboard link) | 1h | 25.23 |
| 25.26 | Failed payment retry | 1h | 25.23 |

### Acceptance Criteria
- [ ] Admin panel only accessible to super_admin
- [ ] User can be activated/deactivated instantly
- [ ] Verification documents viewable in admin
- [ ] Approve/reject with email notification to company
- [ ] Mandate can be hidden from marketplace
- [ ] All admin actions logged in audit_logs

---

## Module 26 — CMS (Content Management System)

### Editable Content Areas

| Section | What's Editable |
|---------|----------------|
| Homepage Hero | Title, subtitle, CTA text, background image |
| Homepage Stats | Number values, labels |
| Homepage Features | Feature cards (icon, title, description) |
| Testimonials | Testimonial cards (name, company, quote, avatar) |
| Pricing Plans | Plan names, prices, features list |
| FAQ | Questions and answers (add/edit/delete/reorder) |
| Blog | Create/edit/delete blog posts with Markdown editor |
| Banners | Announcement banners (text, color, link, date range) |
| Footer | Links, social media URLs, address |
| Email Templates | Transactional email HTML templates |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 26.1 | CMS section list page | 2h | 25.1 |
| 26.2 | Rich text editor (Tiptap or Quill) | 2h | 26.1 |
| 26.3 | Homepage editor (key-value sections) | 3h | 26.2 |
| 26.4 | Pricing plan editor | 2h | 26.1 |
| 26.5 | FAQ editor (CRUD + drag to reorder) | 3h | 26.1 |
| 26.6 | Blog post editor (Markdown + media upload) | 4h | 26.2 |
| 26.7 | Blog post publish / unpublish | 1h | 26.6 |
| 26.8 | Announcement banner creator | 2h | 26.1 |
| 26.9 | Testimonials editor | 2h | 26.1 |
| 26.10 | CMS data API — GET /api/cms/:key | 2h | Phase 0 |
| 26.11 | CMS data API — PUT /api/admin/cms/:key | 2h | 26.10 |
| 26.12 | Cache CMS data in Redis (60 min TTL) | 1h | 26.10 |

### Database

```sql
-- CMS Key-Value Store
CREATE TABLE cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  -- e.g., 'homepage.hero.title', 'pricing.starter.features'
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,          -- Markdown
  cover_image_url TEXT,
  author_id UUID REFERENCES users(id),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft',  -- draft, published
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Banners
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link TEXT,
  type VARCHAR(20) DEFAULT 'info',   -- info, warning, success, error
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Acceptance Criteria
- [ ] All CMS fields editable without code deployment
- [ ] Changes reflect on website within 60 seconds (cache invalidation)
- [ ] Blog posts support Markdown with live preview
- [ ] Banners auto-deactivate after `ends_at` date
- [ ] CMS history: can see who changed what and when

---

## Module 27 — Settings & Configuration

### Settings Sections

**Roles & Permissions**
- View current permission matrix
- Toggle permissions per role (future: custom roles)

**Email Templates**
- Edit HTML email templates for all notification types
- Preview with test data
- Send test email

**SMS Templates**
- Edit SMS text for OTP and key notifications

**Notification Rules**
- Configure which notification types trigger email/SMS/push

**Platform Configuration**
- Maintenance mode toggle
- New registrations: open / invite-only
- Maximum mandates per plan
- Commission range limits

**API Keys**
- Manage Razorpay, SMS, email provider keys (masked display)

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 27.1 | Settings navigation layout | 2h | 25.1 |
| 27.2 | Permission matrix viewer (read-only for now) | 2h | Phase 0 |
| 27.3 | Email template editor (HTML + variables) | 4h | 27.1 |
| 27.4 | Send test email from template editor | 1h | 27.3 |
| 27.5 | SMS template editor | 2h | 27.1 |
| 27.6 | Notification rules configurator | 3h | 27.1 |
| 27.7 | Platform config panel (key-value toggles) | 3h | 27.1 |
| 27.8 | API — GET/PUT /api/admin/settings | 2h | Phase 0 |

### Acceptance Criteria
- [ ] Email templates save and are used for next send
- [ ] Test email delivers correctly with template variables filled
- [ ] Maintenance mode shows a "Under maintenance" page to all non-admins
- [ ] Platform config changes take effect within 60 seconds
