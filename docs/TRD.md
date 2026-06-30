# Technical Requirements Document (TRD)
## COBROKINGS — India's Co-Broking Network
**Version:** 1.0  
**Date:** June 2024  
**Status:** Draft

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│  Web App (React/Vite)    Mobile App (React Native/Expo)  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                      API LAYER                           │
│  Express.js REST API     Socket.io (Real-time)           │
│  Rate Limiting           Auth Middleware                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    SERVICE LAYER                         │
│  Auth Service    Mandate Service    Deal Service         │
│  Chat Service    Payment Service    Notification Service │
│  Search Service  Document Service   Invoice Service      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    DATA LAYER                            │
│  Supabase (PostgreSQL)   Supabase Storage (Files)        │
│  Redis (Cache/Sessions)  Supabase Realtime               │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Frontend Architecture

```
apps/web/src/
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn primitives (Button, Input, etc.)
│   ├── layout/          # Layout components (Navbar, Sidebar, Footer)
│   ├── forms/           # Reusable form components
│   └── shared/          # Business components (MandateCard, UserAvatar)
├── features/            # Feature-sliced modules
│   ├── auth/
│   ├── mandates/
│   ├── marketplace/
│   ├── deals/
│   ├── chat/
│   ├── notifications/
│   ├── payments/
│   └── admin/
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
│   ├── authStore.ts
│   ├── mandateStore.ts
│   ├── chatStore.ts
│   └── notificationStore.ts
├── services/            # API service layer
│   ├── api.ts           # Axios instance
│   ├── authService.ts
│   ├── mandateService.ts
│   └── ...
├── types/               # TypeScript interfaces and types
├── utils/               # Utility helpers
└── constants/           # App constants and enums
```

### 1.3 Backend Architecture

```
packages/api/
├── routes/              # Express route definitions
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── companies.routes.ts
│   ├── mandates.routes.ts
│   ├── marketplace.routes.ts
│   ├── deals.routes.ts
│   ├── chat.routes.ts
│   ├── notifications.routes.ts
│   ├── payments.routes.ts
│   └── admin.routes.ts
├── controllers/         # Request handlers
├── middleware/          # Auth, RBAC, rate limit, validation
├── services/            # Business logic
├── models/              # Database query functions
├── sockets/             # Socket.io event handlers
├── jobs/                # Background jobs (cron)
└── utils/               # Helpers (email, SMS, file upload)
```

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Utility-first CSS |
| Shadcn/ui | latest | Component library |
| React Query (TanStack) | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| React Router | 6.x | Client-side routing |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Axios | 1.x | HTTP client |
| Socket.io-client | 4.x | Real-time client |
| Leaflet / Mapbox | latest | Map rendering |
| Recharts | 2.x | Charts and analytics |
| date-fns | 3.x | Date utilities |

### 2.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Socket.io | 4.x | WebSocket server |
| Supabase JS | 2.x | Database client |
| Redis | 7.x | Caching and session store |
| Bull | 4.x | Job queue |
| Nodemailer | 6.x | Email service |
| Razorpay SDK | latest | Payments |
| Multer | 1.x | File upload middleware |
| Joi / Zod | latest | Request validation |
| Winston | 3.x | Logging |
| Jest | 29.x | Testing |

### 2.3 Database

| Technology | Purpose |
|-----------|---------|
| Supabase (PostgreSQL 15) | Primary database |
| Supabase Auth | Authentication (users, sessions) |
| Supabase Storage | File storage (images, documents) |
| Supabase Realtime | Live subscriptions |
| Redis | Cache, session store, rate limiting |

### 2.4 DevOps & Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Frontend deployment |
| Render | Backend API deployment |
| Supabase Cloud | Database + Auth + Storage |
| Cloudflare | CDN + DDoS protection |
| GitHub Actions | CI/CD pipeline |
| Docker | Local development |
| Sentry | Error monitoring |
| Datadog / Grafana | Performance monitoring |
| AWS S3 / R2 | Document backup |

---

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id),
  company_id UUID REFERENCES companies(id),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  rera_number VARCHAR(50),
  gst_number VARCHAR(20),
  pan_number VARCHAR(20),
  company_reg_number VARCHAR(50),
  verification_status VARCHAR(20) DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,  -- super_admin, company_admin, director, broker, employee, viewer
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- Role Permissions (many-to-many)
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Mandate Tables

```sql
-- Property Categories
CREATE TABLE property_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES property_categories(id)
);

-- Mandates
CREATE TABLE mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  mandate_type VARCHAR(20) NOT NULL,   -- buy, sell, lease, joint_venture, investment
  category_id UUID REFERENCES property_categories(id),
  property_type VARCHAR(50),           -- residential, commercial, industrial, land
  min_budget BIGINT,
  max_budget BIGINT,
  min_area DECIMAL(10,2),
  max_area DECIMAL(10,2),
  area_unit VARCHAR(10),               -- sqft, sqm, acre, gunta
  city VARCHAR(100),
  state VARCHAR(100),
  locations JSONB,                     -- array of preferred micro-locations
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft',  -- draft, active, closed, expired
  expires_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  intro_count INT DEFAULT 0,
  posted_by UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mandate Images
CREATE TABLE mandate_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mandate Documents
CREATE TABLE mandate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id) ON DELETE CASCADE,
  name VARCHAR(255),
  url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved Searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  filters JSONB NOT NULL,
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Co-Broking Tables

```sql
-- Introductions
CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id),
  requester_id UUID REFERENCES users(id),   -- broker requesting intro
  responder_id UUID REFERENCES users(id),   -- mandate owner
  requester_company_id UUID REFERENCES companies(id),
  responder_company_id UUID REFERENCES companies(id),
  status VARCHAR(20) DEFAULT 'pending',     -- pending, accepted, rejected, withdrawn
  message TEXT,
  rejection_reason TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id UUID REFERENCES introductions(id),
  mandate_id UUID REFERENCES mandates(id),
  title VARCHAR(255),
  stage VARCHAR(30) DEFAULT 'lead',
  -- lead, introduction, meeting, site_visit, negotiation, token, agreement, registration, completed
  property_address TEXT,
  deal_value BIGINT,
  brokerage_percentage DECIMAL(5,2),
  commission_split_broker1 DECIMAL(5,2),   -- % to requester broker
  commission_split_broker2 DECIMAL(5,2),   -- % to responder broker
  broker1_id UUID REFERENCES users(id),
  broker2_id UUID REFERENCES users(id),
  company1_id UUID REFERENCES companies(id),
  company2_id UUID REFERENCES companies(id),
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deal Stage History
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  from_stage VARCHAR(30),
  to_stage VARCHAR(30),
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deal Notes
CREATE TABLE deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Communication Tables

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct',   -- direct, company_group, deal_group
  name VARCHAR(255),
  deal_id UUID REFERENCES deals(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  type VARCHAR(20) DEFAULT 'text',     -- text, image, file, voice
  file_url TEXT,
  file_name TEXT,
  file_size INT,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- new_mandate, new_intro, message, deal_update, payment, verification
  title VARCHAR(255),
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.5 Transaction Tables

```sql
-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),   -- nda, loi, mou, agreement, registration
  url TEXT NOT NULL,
  version INT DEFAULT 1,
  uploaded_by UUID REFERENCES users(id),
  is_signed BOOLEAN DEFAULT false,
  signature_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',   -- active, cancelled, expired, past_due
  razorpay_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price BIGINT NOT NULL,          -- in paise (INR * 100)
  interval VARCHAR(20) NOT NULL,  -- monthly, quarterly, annual
  features JSONB,
  max_mandates INT,
  max_members INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(30),   -- subscription, commission, brokerage
  amount BIGINT NOT NULL,   -- in paise
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20),       -- pending, captured, failed, refunded
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  deal_id UUID REFERENCES deals(id),
  from_company_id UUID REFERENCES companies(id),
  to_company_id UUID REFERENCES companies(id),
  type VARCHAR(20),   -- commission, subscription, receipt
  subtotal BIGINT,
  gst_percentage DECIMAL(5,2),
  gst_amount BIGINT,
  total BIGINT,
  status VARCHAR(20) DEFAULT 'draft',   -- draft, sent, paid
  due_date DATE,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.6 CRM Tables

```sql
-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  assigned_to UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  source VARCHAR(50),
  requirement TEXT,
  budget_min BIGINT,
  budget_max BIGINT,
  city VARCHAR(100),
  status VARCHAR(30) DEFAULT 'new',
  -- new, contacted, qualified, negotiation, converted, lost
  priority VARCHAR(10) DEFAULT 'medium',
  notes TEXT,
  converted_to_deal_id UUID REFERENCES deals(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  type VARCHAR(20),   -- company, broker, client, investor
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  organization VARCHAR(255),
  notes TEXT,
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. API Endpoints

### 4.1 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login with email/password | No |
| POST | `/logout` | Logout and invalidate session | Yes |
| POST | `/refresh` | Refresh access token | No |
| POST | `/verify-email` | Verify email OTP | No |
| POST | `/verify-phone` | Verify phone OTP | No |
| POST | `/forgot-password` | Send reset password email | No |
| POST | `/reset-password` | Reset password with token | No |
| GET | `/me` | Get current user | Yes |

### 4.2 Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List users (admin) | Admin |
| GET | `/:id` | Get user profile | Yes |
| PUT | `/:id` | Update user profile | Yes |
| DELETE | `/:id` | Delete user | Admin |
| GET | `/:id/mandates` | Get user's mandates | Yes |

### 4.3 Companies (`/api/companies`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List companies (directory) | Yes |
| POST | `/` | Create company | Yes |
| GET | `/:id` | Get company profile | Yes |
| PUT | `/:id` | Update company | Admin |
| POST | `/:id/members` | Add member to company | Admin |
| DELETE | `/:id/members/:userId` | Remove member | Admin |
| POST | `/:id/verify` | Submit verification documents | Yes |
| GET | `/:id/analytics` | Company analytics | Admin |

### 4.4 Mandates (`/api/mandates`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List mandates (marketplace) | Yes |
| POST | `/` | Create mandate | Yes |
| GET | `/:id` | Get mandate detail | Yes |
| PUT | `/:id` | Update mandate | Yes |
| DELETE | `/:id` | Delete mandate | Yes |
| POST | `/:id/publish` | Publish mandate | Yes |
| POST | `/:id/close` | Close mandate | Yes |
| POST | `/:id/images` | Upload mandate images | Yes |
| POST | `/:id/documents` | Upload mandate documents | Yes |

### 4.5 Introductions (`/api/introductions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List introductions (sent + received) | Yes |
| POST | `/` | Request introduction | Yes |
| GET | `/:id` | Get introduction detail | Yes |
| POST | `/:id/accept` | Accept introduction | Yes |
| POST | `/:id/reject` | Reject introduction | Yes |
| POST | `/:id/withdraw` | Withdraw introduction | Yes |

### 4.6 Deals (`/api/deals`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List deals | Yes |
| POST | `/` | Create deal from introduction | Yes |
| GET | `/:id` | Get deal detail | Yes |
| PUT | `/:id` | Update deal | Yes |
| POST | `/:id/stage` | Move deal to next stage | Yes |
| GET | `/:id/timeline` | Get deal stage history | Yes |
| POST | `/:id/notes` | Add note to deal | Yes |
| POST | `/:id/documents` | Upload deal document | Yes |

### 4.7 Chat (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/conversations` | List conversations | Yes |
| POST | `/conversations` | Create conversation | Yes |
| GET | `/conversations/:id/messages` | Get messages | Yes |
| POST | `/conversations/:id/messages` | Send message | Yes |
| PUT | `/conversations/:id/read` | Mark as read | Yes |

### 4.8 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List notifications | Yes |
| PUT | `/:id/read` | Mark notification as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| GET | `/settings` | Get notification preferences | Yes |
| PUT | `/settings` | Update notification preferences | Yes |

### 4.9 Payments (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/plans` | List subscription plans | No |
| POST | `/subscribe` | Create subscription | Yes |
| POST | `/order` | Create Razorpay order | Yes |
| POST | `/verify` | Verify Razorpay payment | Yes |
| GET | `/history` | Get payment history | Yes |
| POST | `/invoices` | Generate invoice | Yes |
| GET | `/invoices/:id` | Download invoice PDF | Yes |

### 4.10 Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Admin stats | SuperAdmin |
| GET | `/users` | Manage all users | SuperAdmin |
| PUT | `/users/:id/status` | Activate/deactivate user | SuperAdmin |
| GET | `/companies` | Manage all companies | SuperAdmin |
| PUT | `/companies/:id/verify` | Verify company | SuperAdmin |
| GET | `/mandates` | All mandates | SuperAdmin |
| GET | `/payments` | All payments | SuperAdmin |
| GET | `/cms` | CMS content | SuperAdmin |
| PUT | `/cms/:key` | Update CMS content | SuperAdmin |

---

## 5. Real-time Events (Socket.io)

### 5.1 Client-to-Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join a chat room |
| `leave_conversation` | `{ conversationId }` | Leave a chat room |
| `send_message` | `{ conversationId, content, type }` | Send message |
| `typing_start` | `{ conversationId }` | User started typing |
| `typing_stop` | `{ conversationId }` | User stopped typing |
| `mark_read` | `{ conversationId }` | Mark messages as read |

### 5.2 Server-to-Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | Message object | New message received |
| `user_typing` | `{ userId, conversationId }` | Another user typing |
| `message_read` | `{ userId, conversationId }` | Messages read by user |
| `new_notification` | Notification object | New notification |
| `mandate_update` | Mandate object | Mandate status changed |
| `deal_update` | Deal object | Deal stage changed |
| `intro_update` | Introduction object | Intro status changed |

---

## 6. Authentication & Security

### 6.1 JWT Strategy
- Access token: 15 minutes expiry
- Refresh token: 30 days expiry, stored in HttpOnly cookie
- Refresh token rotation on every use
- All tokens invalidated on logout

### 6.2 Role-Based Access Control

```
super_admin    → Full access to everything
company_admin  → Full access within own company
director       → Create/manage mandates, view all company deals
broker         → Create mandates, manage own deals
employee       → View-only + assigned mandates
viewer         → Read-only access
```

### 6.3 Security Measures
- All passwords hashed with bcrypt (12 rounds)
- Rate limiting: 100 requests/minute per IP (auth: 10/minute)
- CORS whitelist (production domains only)
- Helmet.js for HTTP security headers
- Input validation on all endpoints (Zod)
- SQL injection prevention via parameterized queries (Supabase)
- File upload: type validation, size limits (10MB images, 25MB documents)
- HTTPS enforced in production
- Audit log for all sensitive actions
- PII data encrypted at rest (Supabase)

---

## 7. Performance Requirements

| Metric | Target | Strategy |
|--------|--------|----------|
| API response | < 300ms P95 | Redis caching, DB indexes |
| Marketplace load | < 1.5s | Pagination, CDN, lazy images |
| Chat delivery | < 100ms | Socket.io rooms, Redis pub/sub |
| Search results | < 500ms | PostgreSQL full-text search + PostGIS |
| File uploads | < 5s (10MB) | Direct-to-storage upload URLs |
| Dashboard load | < 2s | React Query cache, suspense |

### 7.1 Caching Strategy

```
Redis Cache:
  - User session data: 30 days
  - Mandate feed (hot): 60 seconds TTL
  - Company profile: 5 minutes TTL
  - Notification count: real-time (Socket.io)
  
React Query:
  - Mandate list: stale after 30s
  - User profile: stale after 5min
  - Chat messages: no cache (real-time)
```

---

## 8. File Storage

| Type | Location | Max Size | Formats |
|------|----------|----------|---------|
| Profile avatar | Supabase Storage / avatars | 2MB | jpg, png, webp |
| Company logo | Supabase Storage / logos | 2MB | jpg, png, webp, svg |
| Mandate images | Supabase Storage / mandates | 10MB each, 20 max | jpg, png, webp |
| Documents | Supabase Storage / documents | 25MB | pdf, doc, docx |
| Invoices (generated) | Supabase Storage / invoices | 1MB | pdf |

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
Unit Tests (70%)
  - Utility functions
  - Business logic services
  - Form validations

Integration Tests (20%)
  - API endpoint tests
  - Database queries
  - Auth flows

E2E Tests (10%)
  - Critical user journeys (register, post mandate, co-broke)
  - Payment flow
  - Admin operations
```

### 9.2 Tools
- Unit: Vitest (frontend), Jest (backend)
- Integration: Supertest (API), Supabase Test Helpers
- E2E: Playwright
- Coverage target: 80%+

---

## 10. CI/CD Pipeline

```yaml
# On every PR:
  - Lint (ESLint + Prettier)
  - Type check (tsc --noEmit)
  - Unit tests
  - Build check

# On merge to main:
  - All above +
  - Integration tests
  - Deploy to staging (Vercel preview + Render staging)

# On release tag:
  - All above +
  - E2E tests against staging
  - Deploy to production
  - Notify Slack
```

---

## 11. Environment Configuration

### 11.1 Environment Files

```
.env.development    → Local dev
.env.staging        → Staging environment
.env.production     → Production (secrets in CI/CD vault)
```

### 11.2 Required Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# JWT
JWT_SECRET=                    # min 64 chars
JWT_REFRESH_SECRET=            # min 64 chars

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Redis
REDIS_URL=

# Email (SMTP or Resend)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# SMS (Twilio / Fast2SMS)
SMS_API_KEY=

# App URLs
VITE_APP_URL=
API_URL=
VITE_SOCKET_URL=

# Storage
SUPABASE_STORAGE_BUCKET=

# Monitoring
SENTRY_DSN=
```

---

## 12. Scalability Considerations

- Database: Read replicas for marketplace queries
- API: Horizontal scaling behind load balancer (Render)
- Socket: Redis adapter for multi-instance Socket.io
- Storage: CDN-served (Cloudflare) for all uploaded files
- Search: Upgrade to Elasticsearch/Typesense if needed at scale
- Jobs: Bull queue with Redis for background tasks (emails, invoices, notifications)

---

## 13. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Sentry | Frontend + Backend error tracking |
| Datadog / Grafana | Metrics and performance |
| Uptime Robot | Uptime monitoring |
| Supabase Dashboard | DB performance and query analytics |
| Winston + Logtail | Structured logging |
| GitHub Actions | Build and deployment status |
