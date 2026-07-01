# Phase 0 — Foundation
## Modules: Project Setup · Authentication · Roles & Permissions
**Sprints:** 1–2 | **Priority:** ⭐⭐⭐⭐⭐ Critical

---

## Overview

Phase 0 establishes the entire technical foundation. Nothing in Phase 1–9 can be built without this. Every architectural decision made here affects all future phases.

**Deliverables:**
- Fully configured monorepo
- Working auth system (login, register, OTP, social)
- Role-based access control (6 roles)
- Design system and shared component library
- Local and CI/CD environment working

---

## Module 1 — Project Setup

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 1.1 | Initialize monorepo (Turborepo or nx) | 2h | — |
| 1.2 | Setup `apps/web` — React + Vite + TypeScript | 2h | 1.1 |
| 1.3 | Configure Tailwind CSS + Shadcn/ui | 2h | 1.2 |
| 1.4 | Setup `packages/api` — Express + TypeScript | 2h | 1.1 |
| 1.5 | Setup Supabase project (DB, Auth, Storage) | 1h | — |
| 1.6 | Configure environment variables (.env files) | 1h | 1.5 |
| 1.7 | Setup Docker Compose for local dev | 3h | 1.4 |
| 1.8 | Configure ESLint + Prettier | 1h | 1.2 |
| 1.9 | Setup GitHub Actions CI (lint + type check + test) | 2h | 1.8 |
| 1.10 | Configure Vitest (frontend) + Jest (backend) | 2h | 1.2, 1.4 |
| 1.11 | Create shared `packages/types` for TypeScript interfaces | 2h | 1.1 |
| 1.12 | Setup Axios instance with interceptors | 1h | 1.2 |
| 1.13 | Configure React Query (TanStack Query v5) | 1h | 1.2 |
| 1.14 | Configure Zustand stores (skeleton) | 1h | 1.2 |
| 1.15 | Setup React Router v6 with route guards | 2h | 1.2 |

### Folder Structure

```
cobrokings/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/ui/       # Shadcn components
│   │   │   ├── components/layout/   # Navbar, Sidebar, Footer
│   │   │   ├── components/shared/   # Business components
│   │   │   ├── features/            # Feature modules
│   │   │   ├── pages/               # Route pages
│   │   │   ├── hooks/               # Custom hooks
│   │   │   ├── stores/              # Zustand
│   │   │   ├── services/            # API calls
│   │   │   ├── types/               # Frontend types
│   │   │   ├── utils/               # Helpers
│   │   │   ├── constants/           # Enums, config
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── mobile/                      # Phase 9
├── packages/
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── sockets/
│   │   │   ├── jobs/
│   │   │   └── utils/
│   │   └── tsconfig.json
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   └── shared/
│       ├── types/
│       └── utils/
├── docs/
├── prototype/                       # Current HTML/CSS files
├── .github/workflows/
├── docker-compose.yml
├── package.json
└── turbo.json
```

### Design System Tokens

```typescript
// tailwind.config.ts
const colors = {
  brand: {
    gold: '#D4A017',
    dark: '#0A0A0A',
    surface: '#111111',
    border: '#222222',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
}
```

### Acceptance Criteria
- [ ] `npm run dev` starts both frontend (port 5173) and API (port 3001)
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero errors
- [ ] Vitest + Jest run and pass
- [ ] GitHub Actions pipeline passes on PR

---

## Module 2 — Authentication

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password + social login |
| Register | `/register` | Multi-step registration wizard |
| Forgot Password | `/forgot-password` | Send reset email |
| Reset Password | `/reset-password` | New password with token |
| Verify Email | `/verify-email` | OTP email verification |
| Verify Phone | `/verify-phone` | OTP SMS verification |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 2.1 | Design auth pages (convert existing HTML to React) | 4h | 1.2 |
| 2.2 | Create `useAuth` hook and authStore (Zustand) | 2h | 1.14 |
| 2.3 | Implement register API endpoint | 3h | 1.4 |
| 2.4 | Implement login API endpoint (JWT + refresh token) | 3h | 2.3 |
| 2.5 | Implement refresh token rotation | 2h | 2.4 |
| 2.6 | Email OTP verification flow | 3h | 2.3 |
| 2.7 | Phone OTP verification (Fast2SMS/Twilio) | 3h | 2.3 |
| 2.8 | Forgot password / reset password flow | 3h | 2.3 |
| 2.9 | Google OAuth integration (Supabase Auth) | 2h | 2.3 |
| 2.10 | Auth middleware for API routes | 2h | 2.4 |
| 2.11 | Protected route component in React | 1h | 2.2 |
| 2.12 | Session persistence (auto-refresh on app load) | 2h | 2.5 |
| 2.13 | Rate limiting on auth endpoints (10 req/min) | 1h | 2.3 |
| 2.14 | Write auth unit + integration tests | 4h | 2.4 |

### Auth Flow Diagram

```
User submits email/password
        ↓
API validates credentials
        ↓
Generate access token (15min) + refresh token (30days)
        ↓
Return access token in response body
Store refresh token in HttpOnly cookie
        ↓
Frontend stores access token in memory (authStore)
        ↓
On token expiry → call /auth/refresh automatically
        ↓
On logout → DELETE session, clear cookie
```

### Database Tables

```sql
-- From TRD: users, sessions tables
-- Also uses Supabase Auth (auth.users)

-- Sync Supabase auth.users → public.users via trigger
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Acceptance Criteria
- [ ] User can register with email + phone
- [ ] Email OTP verification works
- [ ] Login returns JWT access token
- [ ] Refresh token rotates and session persists on refresh
- [ ] Forgot password email delivered within 30 seconds
- [ ] Google OAuth login works
- [ ] Rate limiting blocks after 10 failed attempts in 1 minute
- [ ] All auth tests passing

---

## Module 3 — Roles & Permissions

### Role Definitions

| Role | Description | Who Has It |
|------|-------------|-----------|
| `super_admin` | Full platform access | COBROKINGS team only |
| `company_admin` | Full company access | Owner of a brokerage firm |
| `director` | Senior broker with deal approval rights | Senior staff |
| `broker` | Standard broker — post mandates, manage deals | Most users |
| `employee` | Limited access — assigned mandates only | Junior staff |
| `viewer` | Read-only — track deal progress | Clients (future) |

### Permission Matrix

| Permission | super_admin | company_admin | director | broker | employee | viewer |
|-----------|:-----------:|:-------------:|:--------:|:------:|:--------:|:------:|
| create_mandate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| edit_mandate | ✅ | ✅ | ✅ | Own | ❌ | ❌ |
| delete_mandate | ✅ | ✅ | ✅ | Own | ❌ | ❌ |
| view_marketplace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| send_enquiry | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manage_company_users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | Own | ❌ | ❌ |
| manage_payments | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| access_admin_panel | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 3.1 | Seed `roles` and `permissions` tables | 1h | 2.3 |
| 3.2 | Create RBAC middleware for API | 3h | 2.10 |
| 3.3 | Create `usePermissions` hook for frontend | 2h | 2.2 |
| 3.4 | Role-based UI element rendering (show/hide) | 2h | 3.3 |
| 3.5 | Company admin role assignment UI | 2h | 3.1 |
| 3.6 | Write permission tests | 2h | 3.2 |

### Acceptance Criteria
- [ ] Broker cannot close a deal (403 returned)
- [ ] Company admin cannot access admin panel
- [ ] Super admin can access all endpoints
- [ ] UI hides buttons/actions user doesn't have permission for
- [ ] Permission tests cover all 6 roles × 12 permissions
