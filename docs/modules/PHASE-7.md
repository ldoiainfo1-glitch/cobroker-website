# Phase 7 — CRM & Analytics
## Modules: Leads · Contacts · Reports & Analytics
**Sprints:** 16–17 | **Priority:** ⭐⭐⭐⭐

---

## Overview

Phase 7 adds CRM capabilities for brokers to manage their client leads and contacts, plus analytics dashboards so companies and the platform can track performance metrics.

**Input:** Completed Phase 4–6 (deals, payments, documents)  
**Output:** Full CRM system, analytics dashboards, exportable reports

---

## Module 22 — Leads

### Lead Lifecycle

```
New Lead Added (manual entry / website form / referral)
        ↓
Contacted
  Broker reaches out to lead
        ↓
Qualified
  Lead has a genuine requirement
        ↓
Negotiation
  Budget/property discussion in progress
        ↓
Converted → Creates a Mandate + Deal
        OR
Lost (with reason)
```

### Lead Sources

- Manual entry by broker
- Website contact form
- Referral from another broker
- WhatsApp message (future: WA integration)
- Cold call

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Leads List | `/dashboard/crm/leads` | All leads (table + kanban) |
| Lead Detail | `/dashboard/crm/leads/:id` | Full lead view + history |
| Add Lead | `/dashboard/crm/leads/new` | Manual lead entry form |
| Assign Lead | Modal | Assign lead to team member |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 22.1 | Leads list page (table view) | 3h | Phase 1 |
| 22.2 | Lead pipeline (kanban view, optional) | 3h | 22.1 |
| 22.3 | Lead card component | 2h | 22.1 |
| 22.4 | Add lead form | 3h | 22.1 |
| 22.5 | Lead detail page | 3h | 22.1 |
| 22.6 | Edit lead status | 1h | 22.5 |
| 22.7 | Assign lead to team member | 2h | 22.5 |
| 22.8 | Convert lead → create mandate | 3h | Phase 3 |
| 22.9 | Archive / delete lead | 1h | 22.1 |
| 22.10 | Lead notes (activity log) | 2h | 22.5 |
| 22.11 | Lead filters (status, assigned to, city, priority) | 2h | 22.1 |
| 22.12 | API — CRUD /api/leads | 3h | Phase 1 |
| 22.13 | API — PUT /api/leads/:id/assign | 2h | 22.12 |
| 22.14 | API — POST /api/leads/:id/convert | 3h | 22.12 |

### Lead Form Fields

```typescript
interface Lead {
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  requirement: string;     // brief description
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  city: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;     // user ID
  notes?: string;
  followUpDate?: Date;
}
```

### Acceptance Criteria
- [ ] Lead can be added manually with all fields
- [ ] Status change updates the kanban column
- [ ] Assign to team member triggers notification
- [ ] Convert to mandate pre-fills mandate form with lead data
- [ ] Lead activity log tracks all status changes

---

## Module 23 — Contacts

### Contact Types

| Type | Description |
|------|-------------|
| `broker` | Other brokers in the network |
| `company` | Brokerage companies |
| `client` | Property buyers/sellers/investors |
| `investor` | HNI investors looking for property deals |
| `developer` | Builders and developers |

### Features

- Add, edit, delete contacts
- Tag contacts (VIP, Regular, etc.)
- Link contacts to deals and leads
- Contact import (CSV)
- Export contacts (CSV)
- Notes per contact

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Contacts List | `/dashboard/crm/contacts` | All contacts |
| Contact Detail | `/dashboard/crm/contacts/:id` | Full contact view |
| Add Contact | `/dashboard/crm/contacts/new` | Add form |
| Import | `/dashboard/crm/contacts/import` | CSV import |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 23.1 | Contacts list page (table) | 2h | Phase 1 |
| 23.2 | Contact detail page | 2h | 23.1 |
| 23.3 | Add/edit contact form | 2h | 23.1 |
| 23.4 | Tag manager on contacts | 1h | 23.1 |
| 23.5 | Link contact to deals | 2h | Phase 4 |
| 23.6 | CSV import | 3h | 23.1 |
| 23.7 | CSV export | 2h | 23.1 |
| 23.8 | API — CRUD /api/contacts | 3h | Phase 1 |
| 23.9 | API — POST /api/contacts/import | 2h | 23.8 |

### Acceptance Criteria
- [ ] Contacts list is searchable and filterable by type
- [ ] CSV import handles 500+ rows without timeout
- [ ] Contact linked to multiple deals/leads
- [ ] Tags are color-coded and filterable

---

## Module 24 — Reports & Analytics

### Analytics for Brokers (Personal)

| Chart | Description |
|-------|-------------|
| Mandates Over Time | Line chart — mandates posted per week/month |
| Mandates by Type | Pie chart — buy/sell/lease/etc. |
| Introduction Conversion | Funnel — mandates → intros → deals |
| Deal Pipeline Value | Bar chart — deal value per stage |
| Revenue (Brokerage Earned) | Line chart — monthly earnings |
| Top Cities | Bar chart — most active cities |

### Analytics for Company Admins

| Chart | Description |
|-------|-------------|
| Team Performance | Bar chart — mandates and deals per member |
| Revenue Dashboard | Revenue by month with growth % |
| Active Deals | Count by stage |
| Subscription Usage | Mandates used / limit |
| Mandate Success Rate | % of mandates that got intros and closed |

### Analytics for Super Admin (Platform)

| Metric | Description |
|--------|-------------|
| Total Users | Growth over time |
| Active Companies | MAU companies |
| Total Mandates | Posted per day/week |
| Co-Brokings Initiated | Intros per week |
| Deal Close Rate | % of intros → completed |
| Platform Revenue | MRR + ARR |
| City Heatmap | Map of most active cities |

### Pages

| Page | Route | Description |
|------|-------|-------------|
| My Analytics | `/dashboard/analytics` | Personal broker analytics |
| Company Reports | `/dashboard/company/reports` | Company admin view |
| Export Reports | `/dashboard/reports/export` | Download CSV/PDF |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 24.1 | Analytics page layout + date range picker | 3h | Phase 1 |
| 24.2 | Mandates over time chart (Recharts) | 2h | 24.1 |
| 24.3 | Mandates by type pie chart | 1h | 24.1 |
| 24.4 | Introduction conversion funnel | 2h | 24.1 |
| 24.5 | Deal pipeline value chart | 2h | 24.1 |
| 24.6 | Revenue line chart | 2h | 24.1 |
| 24.7 | Company team performance chart | 2h | 24.1 |
| 24.8 | City activity bar chart | 2h | 24.1 |
| 24.9 | Date range filter (last 7d, 30d, 90d, custom) | 2h | 24.1 |
| 24.10 | Export table data as CSV | 2h | 24.1 |
| 24.11 | Export report as PDF | 3h | 24.10 |
| 24.12 | API — GET /api/analytics/mandates | 2h | Phase 3 |
| 24.13 | API — GET /api/analytics/deals | 2h | Phase 4 |
| 24.14 | API — GET /api/analytics/revenue | 2h | Phase 6 |
| 24.15 | Materialized views for heavy analytics queries | 3h | Phase 0 |

### Performance — Materialized Views

```sql
-- Pre-compute mandate stats per company per month
CREATE MATERIALIZED VIEW mandate_stats_monthly AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  company_id,
  mandate_type,
  COUNT(*) AS total,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) AS closed
FROM mandates
GROUP BY 1, 2, 3;

-- Refresh nightly
CREATE EXTENSION pg_cron;
SELECT cron.schedule('refresh-mandate-stats', '0 2 * * *',
  'REFRESH MATERIALIZED VIEW mandate_stats_monthly');
```

### Acceptance Criteria
- [ ] Charts load within 1 second
- [ ] Date range filter updates all charts simultaneously
- [ ] CSV export includes all visible columns
- [ ] PDF report has COBROKINGS branding and date stamp
- [ ] Company admins can only see their company's data
