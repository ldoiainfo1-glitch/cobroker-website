# Product Requirements Document (PRD)
## COBROKINGS — India's Co-Broking Network
**Version:** 1.0  
**Date:** June 2024  
**Status:** Approved for Development

---

## 1. Executive Summary

COBROKINGS is a B2B SaaS platform for the Indian real estate industry. It connects verified real estate brokers and companies to share property mandates, co-broke deals, split commissions, and manage the full lifecycle of a real estate transaction.

The core problem it solves: Indian real estate brokers work in silos. They have mandates (requirements from clients to buy/sell/lease) but lack the network to find counterpart brokers quickly. This results in slow deal closures, missed opportunities, and revenue loss.

**COBROKINGS solves this by being the professional network and workflow tool where brokers share mandates, get formally introduced, agree on commission splits, and close deals — all in one place.**

---

## 2. Problem Statement

### Current Reality
- Brokers share mandates via WhatsApp groups (unstructured, no verification)
- No formal co-broking agreement mechanism exists digitally
- No central verified directory of brokers and their mandates
- Commission disputes are common due to lack of documentation
- No pipeline visibility or deal tracking

### Pain Points by Role

| Stakeholder | Pain Point |
|-------------|-----------|
| Broker | Can't find counterpart broker for a specific mandate quickly |
| Company Admin | Can't manage team's mandates centrally |
| Client | Deals take too long; no transparency |
| Industry | No standardization in co-broking fees or documentation |

---

## 3. Target Users

### Primary Users

**1. Individual Broker**
- RERA registered
- Works independently or under a company
- Posts buy/sell/lease mandates
- Looks for co-broking partners

**2. Company Admin (Brokerage Firm)**
- Manages a team of brokers (5–200 people)
- Needs team mandate visibility
- Controls permissions and deal access

**3. Director / Senior Broker**
- Oversees deals
- Reviews and approves co-broking agreements
- Manages high-value mandates

### Secondary Users

**4. Super Admin (COBROKINGS internal team)**
- Verifies companies
- Manages the platform
- Handles disputes and support

**5. Viewer / Client (future)**
- Read-only access for clients to track deal progress

---

## 4. Product Goals

| Goal | Metric | Target |
|------|--------|--------|
| Network Growth | Registered verified brokers | 50,000 in 12 months |
| Engagement | Mandates posted per week | 10,000+ |
| Deal Closure | Co-brokings closed per month | 1,000+ |
| Revenue | MRR from subscriptions | ₹50L+ in 12 months |
| Retention | Monthly active users | 70%+ |

---

## 5. Features by Phase

### Phase 0 — Foundation
- [x] Design system (colors, typography, components)
- [ ] React + Vite + TypeScript project setup
- [ ] Supabase database setup
- [ ] Authentication (Email/Password, OTP, Social)
- [ ] Role-based access control (6 roles)
- [ ] JWT + refresh token session management

### Phase 1 — Public Website
- [x] Landing page (Hero, Stats, How it Works, Area Circles)
- [x] Authentication pages (Login, Register)
- [ ] Onboarding registration flow (5-step wizard)
- [ ] Email verification
- [ ] Basic user dashboard shell

### Phase 2 — Company Network
- [ ] Company profile page
- [ ] Member/broker directory
- [ ] Follow / invite members
- [ ] Verification system (RERA, GST, PAN, Company Reg)
- [ ] Verification status badge on profiles

### Phase 3 — Marketplace
- [x] Mandate listing form (property details, images, documents)
- [x] Marketplace feed with filters
- [ ] Saved searches
- [ ] Advanced search (polygon, radius, AI)
- [ ] Mandate detail page
- [ ] Mandate status management (Draft → Active → Closed)

### Phase 5 — Communication
- [ ] Direct messaging (broker to broker)
- [ ] Company-level group chat
- [ ] File and image sharing in chat
- [ ] Real-time notifications (Socket.io)
- [ ] Notification preferences
- [ ] Activity feed

### Phase 6 — Transactions
- [ ] Document management (NDA, LOI, MOU, Agreement)
- [ ] Document version history
- [ ] Digital signature integration
- [ ] Membership subscription payments (Razorpay)
- [ ] Brokerage commission payments
- [ ] GST invoice generation
- [ ] Commission invoice generation

### Phase 7 — CRM
- [ ] Lead management (add, assign, convert, archive)
- [ ] Contact management (companies, brokers, clients, investors)
- [ ] Revenue reports
- [ ] Mandate performance analytics
- [ ] Deal success rate metrics
- [ ] Company performance dashboard

### Phase 8 — Admin Panel
- [ ] User and company management
- [ ] Mandate and deal oversight
- [ ] CMS (homepage, blog, FAQ, banners, pricing)
- [ ] Roles and permissions management
- [ ] Email and SMS template management
- [ ] Notification rule configuration

### Phase 9 — Production
- [ ] React Native mobile app (iOS + Android)
- [ ] Push notifications
- [ ] REST API documentation
- [ ] Webhook support
- [ ] Production deployment
- [ ] Monitoring and logging
- [ ] Backup and disaster recovery

---

## 6. User Stories

### Authentication
- As a broker, I want to register with my email and phone so I can create my account
- As a broker, I want to verify my email via OTP so my account is confirmed
- As a broker, I want to log in with Google so I don't need to remember a password
- As an admin, I want to manage sessions so I can force logout compromised accounts

### Mandates
- As a broker, I want to post a buy mandate so counterpart brokers with properties can reach me
- As a broker, I want to filter mandates by city and budget so I find relevant ones quickly
- As a broker, I want to save a search so I get notified when matching mandates are posted
- As a broker, I want to see a mandate on a map so I understand the location requirement

### Co-Broking
- As a broker, I want to co-broke mandates with other verified brokers via the platform chat
- As a broker, I want to define commission split percentages so there's no dispute later

### Company Management
- As a company admin, I want to add my team members so they can post mandates under my company
- As a company admin, I want to set role permissions so junior brokers can't close deals without approval
- As a company admin, I want to see all mandates posted by my team so I have full visibility

### Payments
- As a broker, I want to subscribe monthly so I get access to premium features
- As a broker, I want to generate a commission invoice so I can request payment professionally
- As a broker, I want to split brokerage digitally so the commission goes to the right parties

---

## 7. Screens Inventory (100+ Screens)

### Public Pages (No Auth)
1. Home / Landing
2. About Us
3. Features
4. Pricing
5. FAQ
6. Contact Us
7. Blog List
8. Blog Detail
9. Terms of Service
10. Privacy Policy

### Authentication (11 screens)
11. Login
12. Register (Step 1 — Email/Phone)
13. Register (Step 2 — Company Info)
14. Register (Step 3 — KYC)
15. Register (Step 4 — Business Details)
16. Register (Step 5 — Verification)
17. Email Verification
18. Phone OTP Verification
19. Forgot Password
20. Reset Password
21. Account Pending Approval

### Dashboard (5 screens)
22. Broker Dashboard Home
23. Company Admin Dashboard
24. Director Dashboard
25. Admin Dashboard
26. Notifications Center

### Company Profile (8 screens)
27. My Company Profile
28. Edit Company Profile
29. Team Members List
30. Add Team Member
31. Verification Center
32. Verification Document Upload
33. Verification Status
34. Company Analytics

### Member Directory (4 screens)
35. Member Directory
36. Member Profile (View)
37. Followed Members
38. Invitation Center

### Mandates (10 screens)
39. My Mandates List
40. Create Mandate (Step 1 — Type & Category)
41. Create Mandate (Step 2 — Property Details)
42. Create Mandate (Step 3 — Budget & Terms)
43. Create Mandate (Step 4 — Location)
44. Create Mandate (Step 5 — Images & Documents)
45. Create Mandate (Step 6 — Preview & Publish)
46. Mandate Detail Page
47. Edit Mandate
48. Mandate Analytics

### Marketplace (6 screens)
49. Marketplace Feed (List View)
50. Marketplace Feed (Map View)
51. Mandate Detail — Public View
52. Saved Mandates
53. Saved Searches
54. Advanced Search

### Chat & Messaging (5 screens)
55. Chat Home
56. Direct Message Thread
57. Company Group Chat
58. Chat File Viewer
59. Chat Search

### Notifications (3 screens)
71. All Notifications
72. Notification Settings
73. Activity Feed

### Documents (5 screens)
74. Document Library
75. Document Upload
76. Document Version History
77. Document Viewer
78. Digital Signature Flow

### Payments (7 screens)
79. Subscription Plans
80. Checkout
81. Payment Success
82. Payment Failed
83. Billing History
84. Commission Payment
85. Invoice Generator

### Invoices (3 screens)
86. Invoice List
87. Invoice Detail / Download
88. Receipt

### CRM — Leads (5 screens)
89. Leads List
90. Lead Detail
91. Add Lead
92. Assign Lead
93. Lead Pipeline

### CRM — Contacts (4 screens)
94. Contacts List
95. Contact Detail
96. Add Contact
97. Contact Import

### Reports (5 screens)
98. Revenue Dashboard
99. Mandate Performance Report
100. Deal Success Report
101. Company Performance Report
102. Export Reports

### Admin Panel (8 screens)
103. Admin Dashboard
104. User Management
105. Company Management
106. Mandate Management
107. Payment Management
108. CMS Editor
109. Settings — Roles & Permissions
110. Settings — Email/SMS Templates

### Mobile Exclusive (5 screens)
111. Mobile Home Feed
112. Camera — Upload Property Photo
113. GPS Location Picker
114. Push Notification Opt-In
115. Offline Mode Banner

---

## 8. Success Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| DAU | Daily active users | 5,000+ at launch |
| Mandate Post Rate | Mandates posted per day | 500+ per day |
| Co-Broking Rate | % of mandates that receive an intro | 40%+ |
| Deal Close Rate | % of intros that reach "Completed" | 20%+ |
| Churn Rate | Monthly subscription cancellations | <5% |
| NPS | Net Promoter Score | 50+ |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page Load Time | < 2 seconds (P95) |
| API Response Time | < 300ms (P95) |
| Uptime | 99.9% SLA |
| Mobile Responsiveness | All screens |
| WCAG Accessibility | Level AA |
| Data Security | OWASP Top 10 compliant |
| GDPR / Data Privacy | Compliant with Indian IT Act |

---

## 10. Assumptions & Constraints

### Assumptions
- Users have smartphones with internet connectivity
- Brokers are willing to verify their RERA credentials
- The primary language is English (Hindi support in Phase 2)

### Constraints
- Must work on 2G/3G networks for tier-2/3 cities
- Must support Android 8+ and iOS 13+
- GST invoicing must comply with Indian tax law

---

## 11. Out of Scope (v1.0)

- Property listings for end consumers (this is B2B only)
- Mortgage / loan integration
- Construction project sales
- International brokers
- Video calling
