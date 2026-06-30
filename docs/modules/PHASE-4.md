# Phase 4 — Co-Broking Workflow
## Modules: Introductions · Deal Pipeline · Co-Broking Management
**Sprints:** 9–11 | **Priority:** ⭐⭐⭐⭐⭐ Core

---

## Overview

Phase 4 is the differentiating feature of COBROKINGS. This converts a passive mandate browsing experience into an active co-broking workflow with formal introductions, deal tracking, and commission management.

**Input:** Completed Phase 3 (mandates and marketplace)  
**Output:** Full co-broking workflow from introduction request to deal completion

---

## Module 13 — Introductions

### Introduction Flow

```
Broker A sees Mandate from Broker B in Marketplace
        ↓
Broker A clicks "Request Introduction"
  - Writes a short message (why they can co-broke)
        ↓
Notification sent to Broker B
        ↓
Broker B receives Introduction Request
  - Views Broker A's profile and company
  - Options: Accept / Reject / Wait
        ↓
If Accepted:
  → Introduction status = Accepted
  → A Deal is auto-created in "Introduction" stage
  → Both brokers can now chat and collaborate
  → Co-broking agreement form is presented

If Rejected:
  → Broker A notified with optional reason
  → Broker A cannot re-request for 30 days

If Withdrawn (Broker A):
  → Introduction cancelled before response
```

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Introductions | `/dashboard/introductions` | All sent + received |
| Sent | `/dashboard/introductions/sent` | Intros you've requested |
| Received | `/dashboard/introductions/received` | Intros you need to respond to |
| Introduction Detail | `/dashboard/introductions/:id` | Full intro detail + action |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 13.1 | "Request Introduction" button on mandate card | 1h | Phase 3 |
| 13.2 | Introduction request modal (message input) | 2h | 13.1 |
| 13.3 | Introductions list page (tabs: sent/received) | 3h | Phase 1 |
| 13.4 | Introduction card component | 2h | 13.3 |
| 13.5 | Introduction detail page | 3h | 13.3 |
| 13.6 | Accept introduction action | 2h | 13.5 |
| 13.7 | Reject introduction with reason | 2h | 13.5 |
| 13.8 | Withdraw introduction (before response) | 1h | 13.5 |
| 13.9 | Real-time notification on intro status change | 2h | Phase 0 |
| 13.10 | Auto-create Deal on introduction acceptance | 3h | 13.6 |
| 13.11 | API — POST /api/introductions | 3h | Phase 3 |
| 13.12 | API — PUT /api/introductions/:id/accept | 2h | 13.11 |
| 13.13 | API — PUT /api/introductions/:id/reject | 2h | 13.11 |
| 13.14 | API — PUT /api/introductions/:id/withdraw | 1h | 13.11 |
| 13.15 | Prevent duplicate intro requests (unique constraint) | 1h | 13.11 |
| 13.16 | Write introduction workflow tests | 3h | 13.11 |

### Introduction Request Form

```typescript
interface IntroductionRequest {
  mandateId: string;
  message: string;           // max 500 chars
  // auto-populated:
  requesterId: string;
  responderId: string;
  requesterCompanyId: string;
  responderCompanyId: string;
}
```

### Database

```sql
-- From TRD: introductions table

-- Prevent duplicate intro requests
ALTER TABLE introductions
  ADD CONSTRAINT unique_active_intro
  UNIQUE (mandate_id, requester_id)
  WHERE status NOT IN ('rejected', 'withdrawn');

-- Re-request cooldown (30 days after rejection)
-- Enforced at application layer
```

### Acceptance Criteria
- [ ] Broker cannot request intro for their own mandate
- [ ] Request modal requires a message (min 20 chars)
- [ ] Broker B receives real-time notification on new request
- [ ] Accept auto-creates a deal record
- [ ] Reject with reason sends notification to Broker A
- [ ] Withdrawn intros cannot be accepted
- [ ] Duplicate intro prevention works

---

## Module 14 — Deal Pipeline

### Pipeline Stages

```
Lead
  The initial mandate match before formal introduction

↓

Introduction
  Introduction accepted, deal created, co-broking begins

↓

Meeting
  Both brokers have met (virtual or in-person) to discuss

↓

Site Visit
  Client has done a site visit / property walkthrough

↓

Negotiation
  Price and terms are being negotiated

↓

Token
  Token amount paid (deal confirmation started)

↓

Agreement
  Sale/Lease agreement signed

↓

Registration
  Property registration at registrar office (for sale deals)

↓

Completed ✅
  Deal fully closed, brokerage to be collected
```

### Pages

| Page | Route | Description |
|------|-------|-------------|
| My Deals | `/dashboard/deals` | Kanban view of all deals |
| Deal Detail | `/dashboard/deals/:id` | Full deal view |
| Deal Timeline | `/dashboard/deals/:id/timeline` | Stage change history |
| Deal Documents | `/dashboard/deals/:id/documents` | Deal documents |
| Deal Notes | `/dashboard/deals/:id/notes` | Internal notes |

### Kanban Board Design

```
┌──────────┬──────────┬──────────┬──────────┬─────────────┐
│   Lead   │  Intro   │ Meeting  │  Site    │ Negotiation │
│          │          │          │  Visit   │             │
│ [Card 1] │ [Card 3] │ [Card 5] │ [Card 7] │  [Card 9]  │
│ [Card 2] │ [Card 4] │ [Card 6] │          │             │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
...continues: Token | Agreement | Registration | Completed
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 14.1 | Deal Kanban board UI (drag-and-drop stages) | 6h | Module 13 |
| 14.2 | Deal card component | 2h | 14.1 |
| 14.3 | Move deal to next stage (confirm modal) | 2h | 14.1 |
| 14.4 | Deal detail page (full info) | 4h | 14.1 |
| 14.5 | Deal stage timeline (history) | 2h | 14.4 |
| 14.6 | Add note to deal | 2h | 14.4 |
| 14.7 | Upload document to deal | 2h | 14.4 |
| 14.8 | Set deal value (property price) | 1h | 14.4 |
| 14.9 | Commission calculator (% of deal value) | 2h | 14.4 |
| 14.10 | Commission split UI (Broker A % / Broker B %) | 2h | 14.4 |
| 14.11 | Expected close date picker | 1h | 14.4 |
| 14.12 | Archive deal | 1h | 14.4 |
| 14.13 | Real-time deal stage update notification | 2h | Phase 0 |
| 14.14 | Deal list view (table alternative to kanban) | 2h | 14.1 |
| 14.15 | API — POST /api/deals | 2h | Module 13 |
| 14.16 | API — PUT /api/deals/:id | 2h | 14.15 |
| 14.17 | API — POST /api/deals/:id/stage | 2h | 14.15 |
| 14.18 | API — GET /api/deals/:id/timeline | 2h | 14.15 |
| 14.19 | Write deal pipeline tests | 3h | 14.15 |

### Drag-and-Drop Library

Use `@dnd-kit/core` and `@dnd-kit/sortable` for the Kanban board.

```typescript
interface Deal {
  id: string;
  title: string;
  stage: DealStage;
  propertyAddress: string;
  dealValue: number;
  brokerage: number;
  commissionSplitBroker1: number;
  commissionSplitBroker2: number;
  broker1: User;
  broker2: User;
  mandate: Mandate;
  expectedCloseDate: string;
  createdAt: string;
}

type DealStage =
  | 'lead' | 'introduction' | 'meeting'
  | 'site_visit' | 'negotiation' | 'token'
  | 'agreement' | 'registration' | 'completed';
```

### Acceptance Criteria
- [ ] Kanban board renders all deals in correct stage columns
- [ ] Drag-and-drop moves cards between stages
- [ ] Stage change creates a timeline entry
- [ ] Both brokers (Broker A + B) can see the deal
- [ ] Commission split must total 100%
- [ ] Completed deal is locked and cannot be moved back
- [ ] Deal notifications sent to both parties on stage change

---

## Module 15 — Co-Broking Agreement

### Agreement Contents

```
Co-Broking Agreement
━━━━━━━━━━━━━━━━━━━
Party 1: [Company A Name], represented by [Broker A Name]
Party 2: [Company B Name], represented by [Broker B Name]

Property: [Address]
Client: [Client Name] (masked until deal confirmed)
Deal Value: ₹ [Amount]
Brokerage: [X]% of deal value = ₹ [Calculated]

Commission Split:
  Party 1 receives: [X]% = ₹ [Amount]
  Party 2 receives: [Y]% = ₹ [Amount]

Terms:
  ✓ Both parties agree to maintain confidentiality
  ✓ Neither party will directly contact the other's client
  ✓ Commission is payable upon registration/deal completion
  ✓ Dispute resolution: COBROKINGS arbitration

Signed by: [Digital signature or checkbox acceptance]
Date: [Auto-filled]
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 15.1 | Co-broking agreement form | 3h | Module 13 |
| 15.2 | Agreement preview (printable PDF view) | 3h | 15.1 |
| 15.3 | PDF generation (Puppeteer / html2pdf) | 4h | 15.2 |
| 15.4 | Digital acceptance (checkbox + timestamp) | 2h | 15.2 |
| 15.5 | Agreement stored on Supabase Storage | 1h | 15.3 |
| 15.6 | Email agreement PDF to both parties | 2h | 15.3 |
| 15.7 | Agreement accessible from deal detail | 1h | 15.5 |

### Acceptance Criteria
- [ ] Agreement form pre-fills data from deal
- [ ] PDF generates correctly with all terms
- [ ] Both brokers must accept before deal advances
- [ ] Agreement PDF downloadable from deal detail page
- [ ] Agreement emailed to both parties upon mutual acceptance
