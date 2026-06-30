# Phase 2 — Company Network
## Modules: Company Profile · Member Directory · Verification
**Sprints:** 4–5 | **Priority:** ⭐⭐⭐⭐

---

## Overview

Phase 2 builds the trust layer of COBROKINGS. Verified company profiles and a searchable broker directory allow members to identify and connect with reliable co-broking partners before initiating deals.

**Input:** Completed Phase 1 (dashboard shell, registration)  
**Output:** Verified company profiles, public broker directory, admin verification workflow

---

## Module 7 — Company Profile

### Profile Sections

```
Company Profile
├── Header (Logo, Cover, Name, Badge, City, Follow Button)
├── About (Description, Founded, Type, Specialisation)
├── Services (Tags — Residential, Commercial, etc.)
├── Locations Served (City chips)
├── Team Members (Avatar grid, roles)
├── Certifications (RERA, ISO, etc.)
├── Portfolio (Past deals — count, value)
├── Contact (Phone, Email, Website, Address)
└── Reviews / Ratings (Phase 7)
```

### Pages

| Page | Route | Description |
|------|-------|-------------|
| My Company | `/dashboard/company` | Edit own company profile |
| Public Profile | `/companies/:slug` | View any company (public) |
| Team Management | `/dashboard/company/team` | Add/remove/manage members |
| Verification Center | `/dashboard/company/verification` | Upload and track docs |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 7.1 | Company profile page UI (header, sections) | 5h | Phase 1 |
| 7.2 | Edit company profile form | 3h | 7.1 |
| 7.3 | Logo and cover image upload | 2h | 7.2 |
| 7.4 | Services + Locations tags manager | 2h | 7.2 |
| 7.5 | Team member list view | 2h | 7.1 |
| 7.6 | Invite team member (email invite) | 3h | 7.5 |
| 7.7 | Remove team member | 1h | 7.5 |
| 7.8 | Change team member role | 1h | 7.5 |
| 7.9 | Public company profile page | 3h | 7.1 |
| 7.10 | Follow / Unfollow company | 2h | 7.9 |
| 7.11 | Verification status badge (Verified / Pending / Rejected) | 1h | 7.1 |
| 7.12 | API — GET/PUT /api/companies/:id | 3h | Phase 1 |
| 7.13 | API — POST /api/companies/:id/members | 2h | 7.12 |

### Database

```sql
-- Already in TRD: companies, users (company_id FK)

-- Company Followers
CREATE TABLE company_follows (
  follower_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, company_id)
);

-- Company Certifications
CREATE TABLE company_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(100),
  issuing_body VARCHAR(100),
  issued_at DATE,
  expires_at DATE,
  doc_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company Services
CREATE TABLE company_services (
  company_id UUID REFERENCES companies(id),
  service VARCHAR(100),
  PRIMARY KEY (company_id, service)
);
```

### Acceptance Criteria
- [ ] Company admin can edit all profile fields
- [ ] Logo/cover upload works with preview
- [ ] Public profile is accessible without login
- [ ] Team invite email sends with 24h expiry link
- [ ] Follow/unfollow updates follower count in real-time
- [ ] Verification badge shows correct status

---

## Module 8 — Member Directory

### Directory Features

```
Member Directory
├── Search Bar (name, company, city)
├── Filter Sidebar
│   ├── City / State
│   ├── Specialisation
│   ├── Verification Status
│   └── Rating
├── Sort (Newest, Most Mandates, Rating)
├── Results Grid
│   └── Company Card
│       ├── Logo, Name, City
│       ├── Verification badge
│       ├── Mandate count
│       ├── Follow button
│       └── View Profile
└── Pagination / Infinite scroll
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 8.1 | Member directory page layout | 3h | Phase 1 |
| 8.2 | Company card component | 2h | 8.1 |
| 8.3 | Search bar with debounce | 2h | 8.1 |
| 8.4 | Filter sidebar (city, specialisation, verification) | 3h | 8.1 |
| 8.5 | Sort controls | 1h | 8.1 |
| 8.6 | Infinite scroll / pagination | 2h | 8.1 |
| 8.7 | Follow button on cards | 1h | 8.2 |
| 8.8 | "My Follows" tab | 1h | 8.7 |
| 8.9 | Invite to COBROKINGS (email invite) | 2h | 8.1 |
| 8.10 | API — GET /api/companies (search + filter + paginate) | 3h | 7.12 |

### Search Query Example

```typescript
// GET /api/companies?q=Mumbai&city=Mumbai&verified=true&page=1&limit=20

interface DirectoryQuery {
  q?: string;           // Full text search (name, about)
  city?: string;
  state?: string;
  specialisation?: string;
  verified?: boolean;
  sortBy?: 'newest' | 'mandates' | 'rating';
  page?: number;
  limit?: number;
}
```

### Acceptance Criteria
- [ ] Search returns results within 500ms
- [ ] Filters work in combination
- [ ] Pagination works correctly
- [ ] Empty state shown when no results
- [ ] Follow/unfollow works from directory cards

---

## Module 9 — Verification System

### Verification Documents Required

| Document | Required | Verification Method |
|---------|---------|-------------------|
| RERA Certificate | ✅ Yes | Manual review by admin |
| PAN Card | ✅ Yes | Manual review |
| GST Certificate | ❌ Optional | Manual review |
| Company Registration | ❌ Optional | Manual review |
| Phone OTP | ✅ Yes | Automated |
| Email OTP | ✅ Yes | Automated |

### Verification Status Flow

```
Unverified (default on registration)
        ↓
Documents Submitted (pending admin review)
        ↓
Under Review (admin has opened it)
        ↓
Verified ✅  OR  Rejected ❌ (with reason)
        ↓ (if rejected)
Resubmit option → Pending again
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 9.1 | Verification center UI (status timeline + doc uploads) | 3h | Phase 1 |
| 9.2 | Document upload per type (RERA, GST, PAN) | 2h | 9.1 |
| 9.3 | Verification status banner on dashboard | 1h | 9.1 |
| 9.4 | Email notification on status change | 2h | 9.1 |
| 9.5 | Admin — verification queue UI | 3h | 9.1 |
| 9.6 | Admin — approve / reject with reason | 2h | 9.5 |
| 9.7 | API — POST /api/companies/:id/verify | 2h | 7.12 |
| 9.8 | API — PUT /api/admin/companies/:id/verify | 2h | 9.7 |
| 9.9 | Restrict marketplace access until verified | 2h | 9.1 |

### Database

```sql
-- Company Verification
CREATE TABLE company_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) UNIQUE,
  rera_status VARCHAR(20) DEFAULT 'not_submitted',
  rera_doc_url TEXT,
  rera_number VARCHAR(50),
  gst_status VARCHAR(20) DEFAULT 'not_submitted',
  gst_doc_url TEXT,
  gst_number VARCHAR(20),
  pan_status VARCHAR(20) DEFAULT 'not_submitted',
  pan_doc_url TEXT,
  pan_number VARCHAR(20),
  reg_status VARCHAR(20) DEFAULT 'not_submitted',
  reg_doc_url TEXT,
  overall_status VARCHAR(20) DEFAULT 'unverified',
  -- unverified, pending, under_review, verified, rejected
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Acceptance Criteria
- [ ] Documents can be uploaded per type
- [ ] Status updates are shown with correct color (pending=yellow, verified=green, rejected=red)
- [ ] Rejection reason is visible to company admin
- [ ] Email notification sent on every status change
- [ ] Unverified companies see limited marketplace (can browse, cannot request intros)
- [ ] Admin can approve/reject from admin panel
