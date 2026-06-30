# Phase 5 — Communication
## Modules: Messaging · Notifications · Activity Feed
**Sprints:** 12–13 | **Priority:** ⭐⭐⭐⭐

---

## Overview

Phase 5 adds real-time communication layers. Chat enables brokers to collaborate on deals. Notifications keep every party informed of actions that require attention. The Activity Feed builds a sense of community and live platform activity.

**Input:** Completed Phase 4 (deals and introductions)  
**Output:** Real-time chat, smart notifications, activity feed

---

## Module 16 — Chat & Messaging

### Conversation Types

| Type | Participants | Created When |
|------|-------------|-------------|
| `direct` | 2 brokers | Introduction is accepted |
| `deal_group` | Both brokers + optional team members | Deal is created |
| `company_group` | All members of a company | Company is created |

### Chat Features

- Real-time message delivery (Socket.io)
- Message types: text, image, file, voice note (Phase 2)
- Read receipts (per user, per message)
- Typing indicators
- File sharing (images, PDFs up to 10MB)
- Message search within conversation
- Unread count badge on sidebar

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Chat Home | `/dashboard/chat` | All conversations list |
| Conversation | `/dashboard/chat/:id` | Message thread |
| File Viewer | `/dashboard/chat/:id/files` | All shared files |

### Chat UI Layout

```
┌──────────────────────────────────────────────────────────┐
│  ← Chat                              🔍 Search           │
├──────────────────┬───────────────────────────────────────┤
│                  │                                        │
│  CONVERSATIONS   │  Broker B — Mandate for 3BHK in Bandra│
│  LIST            │  ─────────────────────────────────── │
│                  │                                        │
│  🟢 Broker B     │  [Thu, June 20]                        │
│  "Let me share   │                                        │
│   the details"   │  Broker B: Hi, interested in co-       │
│   2m ago  [3]   │  broking the Bandra mandate?           │
│                  │                                        │
│  Raj & Co       │  You: Yes, let me check with my         │
│  "Documents      │  client today.                         │
│   received"      │                                        │
│   1h ago         │  Broker B: Let me share the details   │
│                  │                                        │
│  Deal #104 Group │                                        │
│  "Site visit..."│  ─────────────────────────────────── │
│   2h ago         │  📎 Type a message...     [Send]       │
└──────────────────┴───────────────────────────────────────┘
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 16.1 | Chat layout (conversation list + thread) | 5h | Phase 4 |
| 16.2 | Conversation list item component | 2h | 16.1 |
| 16.3 | Message bubble component (sent/received) | 2h | 16.1 |
| 16.4 | Send text message | 2h | 16.1 |
| 16.5 | Socket.io chat integration (rooms) | 4h | Phase 0 |
| 16.6 | Real-time message delivery | 2h | 16.5 |
| 16.7 | Typing indicator | 1h | 16.5 |
| 16.8 | Read receipts (double tick) | 2h | 16.5 |
| 16.9 | File upload in chat (image + PDF) | 3h | 16.4 |
| 16.10 | Image preview in chat | 1h | 16.9 |
| 16.11 | Unread message count badge | 2h | 16.5 |
| 16.12 | Infinite scroll for message history | 2h | 16.1 |
| 16.13 | Search within conversation | 2h | 16.1 |
| 16.14 | Auto-create direct chat on intro acceptance | 1h | Phase 4 |
| 16.15 | Auto-create deal group chat on deal creation | 1h | Phase 4 |
| 16.16 | Company group chat creation on company setup | 1h | Phase 2 |
| 16.17 | API — GET /api/chat/conversations | 2h | Phase 1 |
| 16.18 | API — GET /api/chat/conversations/:id/messages | 2h | 16.17 |
| 16.19 | API — POST /api/chat/conversations/:id/messages | 2h | 16.17 |
| 16.20 | File upload to Supabase Storage from chat | 2h | 16.9 |
| 16.21 | Write chat integration tests | 3h | 16.18 |

### Socket.io Events

```typescript
// Client → Server
socket.emit('join_conversation', { conversationId });
socket.emit('send_message', { conversationId, content, type });
socket.emit('typing_start', { conversationId });
socket.emit('typing_stop', { conversationId });
socket.emit('mark_read', { conversationId });

// Server → Client
socket.on('new_message', (message: Message) => {});
socket.on('user_typing', ({ userId, conversationId }) => {});
socket.on('message_read', ({ userId, conversationId }) => {});
```

### Message Model

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isEdited: boolean;
  readBy: string[];   // array of user IDs
  createdAt: string;
}
```

### Acceptance Criteria
- [ ] Message appears on recipient's screen within 200ms
- [ ] Typing indicator shows and disappears correctly
- [ ] Unread count clears when conversation is opened
- [ ] Images render inline in the chat thread
- [ ] File downloads work
- [ ] Conversation history loads when scrolling up
- [ ] Chat works on mobile (full-screen on small screens)

---

## Module 17 — Notifications

### Notification Types

| Type | Trigger | Channel |
|------|---------|---------|
| `new_mandate` | Matches saved search | In-app + email (daily digest) |
| `new_introduction` | Someone requested intro | In-app + email + push |
| `intro_accepted` | Your intro was accepted | In-app + email + push |
| `intro_rejected` | Your intro was rejected | In-app + push |
| `new_message` | New chat message | In-app + push (if not in chat) |
| `deal_stage_update` | Deal moved to new stage | In-app + email + push |
| `deal_document` | Document uploaded to deal | In-app |
| `verification_update` | Company verification status changed | In-app + email |
| `payment_success` | Payment confirmed | In-app + email |
| `mandate_expiring` | Mandate expires in 3 days | In-app + email |
| `mandate_expired` | Mandate has expired | In-app |
| `new_follower` | Someone followed your company | In-app |
| `system` | Platform announcements | In-app + email |

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Notifications | `/dashboard/notifications` | All notifications list |
| Settings | `/dashboard/notifications/settings` | Per-type channel preferences |

### Notification Center UI

```
┌─────────────────────────────────────────────────────────┐
│  Notifications                           Mark all read   │
├─────────────────────────────────────────────────────────┤
│  [ALL] [UNREAD] [INTRODUCTIONS] [DEALS] [MESSAGES]       │
├─────────────────────────────────────────────────────────┤
│  🔵 New introduction request                             │
│     Raj Kumar (Raj Properties) wants to co-broke         │
│     your Bandra mandate.  [View] [Accept] [Reject]       │
│     2 minutes ago                                        │
├─────────────────────────────────────────────────────────┤
│  ✅ Introduction Accepted                                │
│     Suresh from Skyline Realty accepted your request.    │
│     5 hours ago                                          │
├─────────────────────────────────────────────────────────┤
│  📩 New Message                                          │
│     Suresh: "Can you share the floor plan?"              │
│     Yesterday                                            │
└─────────────────────────────────────────────────────────┘
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 17.1 | Notification center page (list + filter tabs) | 3h | Phase 1 |
| 17.2 | Notification item component | 2h | 17.1 |
| 17.3 | Notification bell in topbar (unread count) | 1h | Phase 1 |
| 17.4 | Dropdown notification panel (top 5) | 2h | 17.3 |
| 17.5 | Mark single notification as read | 1h | 17.1 |
| 17.6 | Mark all as read | 1h | 17.1 |
| 17.7 | Socket.io — deliver notifications real-time | 2h | Phase 0 |
| 17.8 | Notification preferences page | 3h | 17.1 |
| 17.9 | Email notification service (Nodemailer/Resend) | 3h | Phase 0 |
| 17.10 | Push notification setup (Phase 9 — mobile) | — | Phase 9 |
| 17.11 | Daily email digest for saved searches | 3h | Phase 3 |
| 17.12 | Mandate expiry notification cron job | 2h | Phase 3 |
| 17.13 | API — GET /api/notifications | 2h | Phase 1 |
| 17.14 | API — PUT /api/notifications/:id/read | 1h | 17.13 |
| 17.15 | API — GET /api/notifications/settings | 1h | 17.13 |
| 17.16 | API — PUT /api/notifications/settings | 2h | 17.15 |

### Notification Delivery Service

```typescript
// notificationService.ts
async function sendNotification({
  userId,
  type,
  title,
  body,
  data,
  channels = ['in_app'],
}: NotificationPayload) {
  // 1. Save to DB
  await db.notifications.insert({ userId, type, title, body, data });

  // 2. Real-time via Socket.io
  if (channels.includes('in_app')) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }

  // 3. Email via Resend
  if (channels.includes('email') && userPrefs.emailEnabled) {
    await emailService.send({ to: user.email, template: type, data });
  }

  // 4. Push (Phase 9)
  if (channels.includes('push') && userPrefs.pushEnabled) {
    await pushService.send({ deviceToken: user.deviceToken, title, body });
  }
}
```

### Acceptance Criteria
- [ ] Notification bell badge updates in real-time
- [ ] All notification types render correctly
- [ ] Filter tabs (All, Unread, by type) work
- [ ] Notification preferences save and persist
- [ ] Email notifications deliver within 2 minutes
- [ ] Clicking notification redirects to relevant page

---

## Module 18 — Activity Feed

### Feed Item Types

```
📋 New Mandate Posted
   "XYZ Realty posted a new Buy mandate in Mumbai — 3BHK, ₹1.5–2Cr"
   2 min ago

🤝 Deal Closed
   "Raj Properties and Skyline Realty closed a deal in Andheri West"
   1 hour ago

✅ New Verified Member
   "Welcome ABC Brokers — verified and joined the network!"
   3 hours ago

📣 Platform Announcement
   "COBROKINGS now covers 10 new cities in tier-2 India!"
   2 days ago
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 18.1 | Activity feed component | 3h | Phase 1 |
| 18.2 | Feed item component (per type) | 2h | 18.1 |
| 18.3 | Feed on dashboard home | 1h | Phase 1 |
| 18.4 | Public activity feed page | 2h | 18.1 |
| 18.5 | API — generate feed events on key actions | 3h | Phase 4 |
| 18.6 | Infinite scroll feed | 2h | 18.1 |
| 18.7 | Real-time feed updates (Socket.io) | 2h | Phase 0 |

### Database

```sql
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  -- new_mandate, deal_closed, new_member, announcement
  actor_id UUID REFERENCES users(id),
  actor_company_id UUID REFERENCES companies(id),
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Acceptance Criteria
- [ ] Feed shows mixed activity types in chronological order
- [ ] New activities appear without page refresh
- [ ] Clicking a feed item navigates to the relevant entity
- [ ] Feed loads next page on scroll
