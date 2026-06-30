# Phase 9 — Mobile App & Production
## Modules: Mobile App · REST API · Production Deployment
**Sprints:** 19–20 | **Priority:** ⭐⭐⭐⭐⭐

---

## Overview

Phase 9 is the final phase — making COBROKINGS production-ready and mobile-first. The React Native app brings the full platform to brokers' phones, and the production infrastructure ensures reliability, security, and scalability.

**Input:** Completed Phases 0–8 (full web platform)  
**Output:** Published mobile apps (iOS + Android), documented API, production deployment

---

## Module 28 — Mobile App (React Native + Expo)

### Technology Stack

| Technology | Purpose |
|-----------|---------|
| React Native (Expo SDK 51) | Mobile app framework |
| Expo Router | File-based navigation |
| NativeWind | Tailwind CSS for React Native |
| React Query | Server state (shared with web) |
| Zustand | Client state (shared with web) |
| Expo Notifications | Push notifications |
| Expo Camera | Property photo capture |
| Expo Location | GPS for mandate location |
| Expo SecureStore | Secure token storage |
| React Native Maps | Map view for mandates |

### Shared Code Strategy

```
packages/shared/
├── types/          ← Same TypeScript types on web + mobile
├── utils/          ← Business logic utilities
├── services/       ← API service functions (Axios)
└── stores/         ← Zustand stores (cross-platform)
```

The API services and stores are shared. Only UI components differ between web and mobile.

### Mobile Screens

**Bottom Tab Navigation**
```
[Home Feed] [Mandates] [+ Post] [Deals] [Profile]
```

**Screen List**

| Screen | Description |
|--------|-------------|
| Onboarding (3 slides) | App intro for first-time users |
| Login | Email/password + biometric |
| Register | Simplified registration (full flow on web) |
| Home Feed | Marketplace feed with key metrics |
| Mandate List | My mandates with swipe actions |
| Create Mandate | Simplified 3-step creation with camera |
| Mandate Detail | Full mandate with intro button |
| Marketplace | Browse mandates with map toggle |
| Deals | Kanban view (adapted for mobile) |
| Deal Detail | Full deal with stage movement |
| Chat | Chat list + thread |
| Notifications | All notifications |
| Profile | My profile + company |
| Settings | App settings + logout |

### Mobile-Exclusive Features

**Camera Integration**
```typescript
// Capture property photos directly
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsMultipleSelection: true,
  quality: 0.8,
});
```

**GPS Location Picker**
```typescript
// Auto-fill mandate location from GPS
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Balanced,
});
const address = await Location.reverseGeocodeAsync(location.coords);
```

**Push Notifications**
```typescript
// Register device token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: Constants.expoConfig.extra.eas.projectId,
});
await api.post('/users/push-token', { token: token.data });

// Handle foreground notification
Notifications.addNotificationReceivedListener((notification) => {
  // Show in-app toast
});

// Handle background tap
Notifications.addNotificationResponseReceivedListener((response) => {
  // Navigate to relevant screen
  router.push(response.notification.request.content.data.link);
});
```

**Offline Support (Basic)**
- Cache last 20 mandates for offline browsing
- Show "Offline" banner when no connection
- Queue actions (cannot post mandate offline)

**Biometric Login**
```typescript
// iOS Face ID / Touch ID, Android Fingerprint
const { success } = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Confirm your identity',
  fallbackLabel: 'Use PIN',
});
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 28.1 | Expo project init + navigation setup | 3h | Phase 0 |
| 28.2 | Auth screens (login, register) | 4h | 28.1 |
| 28.3 | Home feed screen | 3h | 28.1 |
| 28.4 | Marketplace + mandate cards | 4h | 28.1 |
| 28.5 | Mandate detail screen | 3h | 28.1 |
| 28.6 | Create mandate (3-step mobile flow) | 5h | 28.1 |
| 28.7 | Camera integration for photos | 2h | 28.6 |
| 28.8 | GPS location picker | 2h | 28.6 |
| 28.9 | Deals screen (list + stage view) | 4h | 28.1 |
| 28.10 | Chat screens | 5h | 28.1 |
| 28.11 | Notifications screen | 2h | 28.1 |
| 28.12 | Push notification setup (Expo) | 3h | 28.1 |
| 28.13 | Push token saved to API | 1h | 28.12 |
| 28.14 | Background notification handler (deep link) | 2h | 28.12 |
| 28.15 | Biometric login | 2h | 28.2 |
| 28.16 | Offline cache (last 20 mandates) | 3h | 28.4 |
| 28.17 | App icon + splash screen (brand) | 1h | 28.1 |
| 28.18 | EAS Build setup (iOS + Android) | 3h | 28.1 |
| 28.19 | Submit to App Store (iOS) | 4h | 28.18 |
| 28.20 | Submit to Google Play Store | 4h | 28.18 |
| 28.21 | OTA updates via Expo Updates | 2h | 28.18 |

### Acceptance Criteria
- [ ] App installs and runs on Android 8+ and iOS 13+
- [ ] Login, marketplace, mandate creation, deals all functional
- [ ] Push notifications received in foreground and background
- [ ] Camera opens and photos upload successfully
- [ ] GPS fills location in mandate creation
- [ ] Biometric login works on supported devices
- [ ] App passes App Store and Play Store review guidelines

---

## Module 29 — REST API Documentation

### Tools

| Tool | Purpose |
|------|---------|
| Swagger / OpenAPI 3.0 | API specification |
| Swagger UI | Interactive docs browser |
| Postman Collection | API testing collection |

### API Documentation Structure

```
Authentication
  POST /auth/register
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout
  POST /auth/forgot-password
  POST /auth/reset-password

Users
  GET  /users/me
  PUT  /users/:id
  GET  /users/:id/mandates

Companies
  GET  /companies
  POST /companies
  GET  /companies/:id
  PUT  /companies/:id
  POST /companies/:id/members
  POST /companies/:id/verify

Mandates
  GET  /mandates
  POST /mandates
  GET  /mandates/:id
  PUT  /mandates/:id
  DELETE /mandates/:id
  POST /mandates/:id/publish
  POST /mandates/:id/close

Introductions
  GET  /introductions
  POST /introductions
  PUT  /introductions/:id/accept
  PUT  /introductions/:id/reject

Deals
  GET  /deals
  POST /deals
  GET  /deals/:id
  PUT  /deals/:id
  POST /deals/:id/stage

Chat
  GET  /chat/conversations
  POST /chat/conversations
  GET  /chat/conversations/:id/messages
  POST /chat/conversations/:id/messages

Payments
  GET  /payments/plans
  POST /payments/order
  POST /payments/verify
  GET  /payments/history

Notifications
  GET  /notifications
  PUT  /notifications/read-all
  GET  /notifications/settings
  PUT  /notifications/settings
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 29.1 | Add OpenAPI annotations to all routes | 6h | Phase 8 |
| 29.2 | Swagger UI at `/api/docs` (dev + staging only) | 1h | 29.1 |
| 29.3 | Export Postman collection | 2h | 29.1 |
| 29.4 | API versioning strategy (`/api/v1/`) | 2h | Phase 0 |
| 29.5 | Webhook documentation | 2h | Phase 6 |
| 29.6 | Rate limiting documentation | 1h | Phase 0 |

---

## Module 30 — Production Deployment

### Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                     PRODUCTION                           │
│                                                          │
│  Cloudflare DNS + CDN + DDoS Protection                 │
│          ↓                    ↓                          │
│  Vercel (Web App)      Render (API Server)               │
│  apps/web              packages/api                      │
│                                  ↓                       │
│                     Supabase Cloud (DB + Auth + Storage) │
│                     Redis Cloud (Render Redis)           │
└─────────────────────────────────────────────────────────┘
```

### Deployment Checklist

**Environment**
- [ ] All environment variables set in Vercel + Render
- [ ] Supabase prod project configured (separate from dev)
- [ ] Redis prod instance provisioned
- [ ] Cloudflare domain DNS configured
- [ ] SSL certificates active

**Security**
- [ ] HTTPS enforced (HTTP → HTTPS redirect)
- [ ] CORS set to production domains only
- [ ] Rate limiting configured
- [ ] Secrets rotation plan in place
- [ ] Supabase Row Level Security (RLS) enabled on all tables
- [ ] SQL injection prevention verified
- [ ] File upload type + size limits enforced

**Performance**
- [ ] Frontend bundle size < 500KB (gzipped)
- [ ] Images served via Cloudflare CDN
- [ ] Database indexes verified with `EXPLAIN ANALYZE`
- [ ] Redis caching active for hot routes
- [ ] API response time < 300ms tested

**Monitoring**
- [ ] Sentry configured (frontend + backend)
- [ ] Uptime monitor (UptimeRobot or Better Uptime)
- [ ] Render health checks enabled
- [ ] Error alerting to Slack/email configured
- [ ] Database backup schedule set (daily, 30-day retention)

**Launch Readiness**
- [ ] All Phase 0–8 features deployed to staging
- [ ] Staging smoke test completed
- [ ] Load test with 100 concurrent users passed
- [ ] Mobile app approved by App Store + Play Store
- [ ] Privacy Policy and Terms of Service published
- [ ] GDPR / Indian IT Act compliance verified

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 30.1 | Vercel project setup + env vars | 2h | Phase 0 |
| 30.2 | Render API deployment + env vars | 2h | Phase 0 |
| 30.3 | Supabase production project setup | 2h | Phase 0 |
| 30.4 | Run all migrations on production DB | 1h | 30.3 |
| 30.5 | Cloudflare DNS + CDN configuration | 2h | 30.1 |
| 30.6 | Supabase Row Level Security policies | 5h | Phase 0 |
| 30.7 | Sentry integration (frontend + backend) | 2h | Phase 0 |
| 30.8 | Uptime monitoring setup | 1h | 30.2 |
| 30.9 | GitHub Actions: prod deployment workflow | 3h | Phase 0 |
| 30.10 | Load testing (k6 or Artillery) | 3h | 30.2 |
| 30.11 | Database backup schedule (Supabase PITR) | 1h | 30.3 |
| 30.12 | Production smoke test checklist | 2h | 30.1 |
| 30.13 | Staging environment (mirrors production) | 2h | 30.1 |

### Supabase Row Level Security

```sql
-- Example: Users can only see mandates from verified companies
CREATE POLICY "view_active_mandates"
ON mandates FOR SELECT
USING (
  status = 'active'
  AND company_id IN (
    SELECT id FROM companies WHERE verification_status = 'verified'
  )
);

-- Users can only edit their own mandates
CREATE POLICY "edit_own_mandates"
ON mandates FOR UPDATE
USING (posted_by = auth.uid());

-- Users can only see their own deals
CREATE POLICY "view_own_deals"
ON deals FOR SELECT
USING (
  broker1_id = auth.uid() OR broker2_id = auth.uid()
);
```

### Post-Launch

| Task | Frequency | Owner |
|------|-----------|-------|
| Monitor Sentry errors | Daily | Dev team |
| Review Uptime alerts | Real-time | On-call |
| Database performance review | Weekly | Dev team |
| Security dependency audit | Monthly | Dev team |
| Load test | Quarterly | Dev team |
| Backup restoration test | Quarterly | Dev team |

### Acceptance Criteria
- [ ] Production deployment completes without downtime
- [ ] All features work identically to staging
- [ ] Sentry captures errors within 30 seconds
- [ ] Uptime alert fires within 2 minutes of downtime
- [ ] Database restored from backup within 1 hour (RTO)
- [ ] Mobile apps live on both stores

---

## Summary — Full 30-Module Roadmap

| Phase | Modules | Sprints | Key Deliverable |
|-------|---------|---------|----------------|
| Phase 0 | 1–3 | 1–2 | Monorepo, auth, roles |
| Phase 1 | 4–6 | 3 | Public website, registration, dashboard |
| Phase 2 | 7–9 | 4–5 | Company profiles, directory, verification |
| Phase 3 | 10–12 | 6–8 | Mandates, marketplace, search |
| Phase 4 | 13–15 | 9–11 | Co-broking flow, deal pipeline |
| Phase 5 | 16–18 | 12–13 | Chat, notifications, activity feed |
| Phase 6 | 19–21 | 14–15 | Documents, payments, invoices |
| Phase 7 | 22–24 | 16–17 | CRM, contacts, reports |
| Phase 8 | 25–27 | 18 | Admin panel, CMS, settings |
| Phase 9 | 28–30 | 19–20 | Mobile app, API docs, production |

**Total: 30 Modules · 20 Sprints · ~40 Weeks**
