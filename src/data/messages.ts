import type { Conversation, ChatMessage, ChatNotification } from '@/types'

const now = Date.now()
const mins = (n: number) => new Date(now - n * 60_000).toISOString()
const hrs = (n: number) => new Date(now - n * 3_600_000).toISOString()
const days = (n: number) => new Date(now - n * 86_400_000).toISOString()

// ─── Conversations ────────────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    participants: [
      { id: 'b1', name: 'Arjun Mehta', company: 'Skyline Realty', avatarInitial: 'AM', isVerified: true, isOnline: true },
    ],
    lastMessage: 'I can arrange a site visit this Thursday. Does 11am work for your client?',
    lastMessageAt: mins(3),
    lastMessageType: 'text',
    unreadCount: 2,
    isPinned: true,
    linkedDealId: 'deal-104',
  },
  {
    id: 'c2',
    type: 'direct',
    participants: [
      { id: 'b2', name: 'Priya Nair', company: 'Prime Homes', avatarInitial: 'PN', isVerified: true, isOnline: false, lastSeen: hrs(1) },
    ],
    lastMessage: 'Sharing the Bandra West mandate. Budget is flexible up to ₹2.5Cr.',
    lastMessageAt: hrs(2),
    lastMessageType: 'mandate_share',
    unreadCount: 0,
    linkedIntroId: 'intro-22',
  },
  {
    id: 'c3',
    type: 'direct',
    participants: [
      { id: 'b3', name: 'Rahul Sharma', company: 'Capital Properties', avatarInitial: 'RS', isVerified: true, isOnline: true },
    ],
    lastMessage: 'Deal moved to Negotiation. Please confirm the revised LOI.',
    lastMessageAt: hrs(5),
    lastMessageType: 'deal_update',
    unreadCount: 1,
    linkedDealId: 'deal-98',
  },
  {
    id: 'c4',
    type: 'direct',
    participants: [
      { id: 'b4', name: 'Sneha Joshi', company: 'Realty Pulse', avatarInitial: 'SJ', isVerified: true, isOnline: false, lastSeen: days(1) },
    ],
    lastMessage: 'Sure, let me check with our Whitefield team and revert.',
    lastMessageAt: days(1),
    lastMessageType: 'text',
    unreadCount: 0,
  },
  {
    id: 'c5',
    type: 'direct',
    participants: [
      { id: 'b5', name: 'Vijay Kulkarni', company: 'Bricks Beyond', avatarInitial: 'VK', isVerified: true, isOnline: false, lastSeen: days(2) },
    ],
    lastMessage: 'Client confirmed token amount. Agreement to follow next week.',
    lastMessageAt: days(2),
    lastMessageType: 'text',
    unreadCount: 0,
    linkedDealId: 'deal-87',
  },
  {
    id: 'c6',
    type: 'group',
    groupName: 'BKC Circle — Deal Closed 🎉',
    groupInitial: 'BK',
    participants: [
      { id: 'b1', name: 'Arjun Mehta', company: 'Skyline Realty', avatarInitial: 'AM', isVerified: true, isOnline: true },
      { id: 'b2', name: 'Priya Nair', company: 'Prime Homes', avatarInitial: 'PN', isVerified: true, isOnline: false },
      { id: 'b3', name: 'Rahul Sharma', company: 'Capital Properties', avatarInitial: 'RS', isVerified: true, isOnline: true },
    ],
    lastMessage: 'Congrats to the team! Deal registered. 🥂',
    lastMessageAt: days(3),
    lastMessageType: 'text',
    unreadCount: 0,
  },
  {
    id: 'c7',
    type: 'direct',
    participants: [
      { id: 'b6', name: 'Anil Desai', company: 'Metro Brokers', avatarInitial: 'AD', isVerified: false, isOnline: false, lastSeen: days(4) },
    ],
    lastMessage: 'Please share your RERA number for the co-broking agreement.',
    lastMessageAt: days(5),
    lastMessageType: 'text',
    unreadCount: 0,
  },
]

// ─── Messages per conversation ────────────────────────────────────────────────
export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'system', systemText: 'Introduction accepted · Deal #104 created', sentAt: days(5), isRead: true, isMine: false },
    { id: 'm2', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'text', text: 'Hi! I have a serious buyer for Grade A office in BKC. Budget up to ₹12Cr. Looking for 5,000–8,000 sq ft.', sentAt: days(5), isRead: true, isMine: false },
    { id: 'm3', conversationId: 'c1', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Great! We have a couple of options. Let me share the best one.', sentAt: days(5), isRead: true, isMine: true },
    { id: 'm4', conversationId: 'c1', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'mandate_share', mandateCard: { id: 'man-01', title: 'Grade A Office Floor in BKC', mandateType: 'sell', budget: '₹9.5Cr – ₹12Cr', city: 'Mumbai', propertyType: 'commercial' }, sentAt: days(4), isRead: true, isMine: true },
    { id: 'm5', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'text', text: 'Perfect, this looks exactly right. Can we do a virtual tour first?', sentAt: days(4), isRead: true, isMine: false },
    { id: 'm6', conversationId: 'c1', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Of course. I\u2019ll arrange with the owner. Are you free this week?', sentAt: days(3), isRead: true, isMine: true },
    { id: 'm7', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'text', text: 'Wednesday afternoon or Thursday morning works.', sentAt: days(2), isRead: true, isMine: false },
    { id: 'm8', conversationId: 'c1', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Let me confirm with the owner and get back to you by evening.', sentAt: days(2), isRead: true, isMine: true },
    { id: 'm9', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'deal_update', text: 'Deal #104 moved to Site Visit stage', systemText: 'Deal #104 moved to Site Visit stage', sentAt: days(1), isRead: true, isMine: false },
    { id: 'm10', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'text', text: 'I can arrange a site visit this Thursday. Does 11am work for your client?', sentAt: mins(3), isRead: false, isMine: false },
    { id: 'm11', conversationId: 'c1', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'text', text: 'Also the owner is flexible on possession date — October or November.', sentAt: mins(2), isRead: false, isMine: false },
  ],
  c2: [
    { id: 'm20', conversationId: 'c2', senderId: 'b2', senderName: 'Priya Nair', senderInitial: 'PN', type: 'system', systemText: 'Introduction accepted · Bandra West Mandate', sentAt: days(10), isRead: true, isMine: false },
    { id: 'm21', conversationId: 'c2', senderId: 'b2', senderName: 'Priya Nair', senderInitial: 'PN', type: 'text', text: 'Hello! I saw your listing on the platform. My client is looking for exactly this type of property.', sentAt: days(10), isRead: true, isMine: false },
    { id: 'm22', conversationId: 'c2', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Hi Priya! Yes, the mandate is still active. Client is flexible on possession.', sentAt: days(10), isRead: true, isMine: true },
    { id: 'm23', conversationId: 'c2', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'mandate_share', mandateCard: { id: 'man-02', title: '3BHK Sea View — Bandra West', mandateType: 'sell', budget: '₹2.2Cr – ₹2.5Cr', city: 'Mumbai', propertyType: 'residential' }, sentAt: hrs(2), isRead: true, isMine: true },
    { id: 'm24', conversationId: 'c2', senderId: 'b2', senderName: 'Priya Nair', senderInitial: 'PN', type: 'text', text: 'Sharing the Bandra West mandate. Budget is flexible up to ₹2.5Cr.', sentAt: hrs(2), isRead: true, isMine: false },
  ],
  c3: [
    { id: 'm30', conversationId: 'c3', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'system', systemText: 'Introduction accepted · Industrial Land Deal', sentAt: days(15), isRead: true, isMine: false },
    { id: 'm31', conversationId: 'c3', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'text', text: 'Rahul here. The industrial land near Bhiwandi — are you still representing the seller?', sentAt: days(15), isRead: true, isMine: false },
    { id: 'm32', conversationId: 'c3', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Yes, mandate is active until December. 12 acres clear title.', sentAt: days(14), isRead: true, isMine: true },
    { id: 'm33', conversationId: 'c3', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'text', text: 'My client wants NA conversion documents. Can you arrange?', sentAt: days(14), isRead: true, isMine: false },
    { id: 'm34', conversationId: 'c3', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Yes will share via email. Let me get the LOI first.', sentAt: days(12), isRead: true, isMine: true },
    { id: 'm35', conversationId: 'c3', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'deal_update', systemText: 'Deal #98 moved to Negotiation', text: 'Deal #98 moved to Negotiation', sentAt: hrs(5), isRead: false, isMine: false },
    { id: 'm36', conversationId: 'c3', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'text', text: 'Deal moved to Negotiation. Please confirm the revised LOI.', sentAt: hrs(5), isRead: false, isMine: false },
  ],
  c4: [
    { id: 'm40', conversationId: 'c4', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Hi Sneha, wanted to explore co-broking on your Whitefield office listings.', sentAt: days(8), isRead: true, isMine: true },
    { id: 'm41', conversationId: 'c4', senderId: 'b4', senderName: 'Sneha Joshi', senderInitial: 'SJ', type: 'text', text: 'Hi! Sure, we have two pre-lease options in Whitefield right now.', sentAt: days(7), isRead: true, isMine: false },
    { id: 'm42', conversationId: 'c4', senderId: 'b4', senderName: 'Sneha Joshi', senderInitial: 'SJ', type: 'text', text: 'Sure, let me check with our Whitefield team and revert.', sentAt: days(1), isRead: true, isMine: false },
  ],
  c5: [
    { id: 'm50', conversationId: 'c5', senderId: 'b5', senderName: 'Vijay Kulkarni', senderInitial: 'VK', type: 'text', text: 'The Kharadi deal is moving fast. Client has agreed on ₹88L.', sentAt: days(5), isRead: true, isMine: false },
    { id: 'm51', conversationId: 'c5', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Great! Let me get the token receipt from our side.', sentAt: days(4), isRead: true, isMine: true },
    { id: 'm52', conversationId: 'c5', senderId: 'b5', senderName: 'Vijay Kulkarni', senderInitial: 'VK', type: 'text', text: 'Client confirmed token amount. Agreement to follow next week.', sentAt: days(2), isRead: true, isMine: false },
  ],
  c6: [
    { id: 'm60', conversationId: 'c6', senderId: 'b1', senderName: 'Arjun Mehta', senderInitial: 'AM', type: 'system', systemText: 'Group created: BKC Circle — Deal Closed 🎉', sentAt: days(4), isRead: true, isMine: false },
    { id: 'm61', conversationId: 'c6', senderId: 'b2', senderName: 'Priya Nair', senderInitial: 'PN', type: 'text', text: 'What a deal this was! Took 45 days from intro to registration 💪', sentAt: days(3), isRead: true, isMine: false },
    { id: 'm62', conversationId: 'c6', senderId: 'b3', senderName: 'Rahul Sharma', senderInitial: 'RS', type: 'text', text: 'Congrats to the team! Deal registered. 🥂', sentAt: days(3), isRead: true, isMine: false },
  ],
  c7: [
    { id: 'm70', conversationId: 'c7', senderId: 'b6', senderName: 'Anil Desai', senderInitial: 'AD', type: 'text', text: 'Hi, I saw your mandate on the platform. I have a matching buyer.', sentAt: days(6), isRead: true, isMine: false },
    { id: 'm71', conversationId: 'c7', senderId: 'me', senderName: 'Me', senderInitial: 'DB', type: 'text', text: 'Sure, let me know the client details and budget range.', sentAt: days(6), isRead: true, isMine: true },
    { id: 'm72', conversationId: 'c7', senderId: 'b6', senderName: 'Anil Desai', senderInitial: 'AD', type: 'text', text: 'Please share your RERA number for the co-broking agreement.', sentAt: days(5), isRead: true, isMine: false },
  ],
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: ChatNotification[] = [
  { id: 'n1', type: 'new_introduction', title: 'New Introduction Request', body: 'Arjun Mehta (Skyline Realty) requested an introduction to your BKC Office mandate', isRead: false, createdAt: mins(10), actionUrl: '/dashboard/introductions', avatarInitial: 'AM' },
  { id: 'n2', type: 'deal_stage_update', title: 'Deal Moved to Negotiation', body: 'Deal #98 with Rahul Sharma has been moved to the Negotiation stage', isRead: false, createdAt: hrs(5), actionUrl: '/dashboard/deals', avatarInitial: 'RS' },
  { id: 'n3', type: 'new_message', title: 'New Message from Arjun Mehta', body: '"I can arrange a site visit this Thursday. Does 11am work for your client?"', isRead: false, createdAt: mins(3), actionUrl: '/dashboard/chat', avatarInitial: 'AM' },
  { id: 'n4', type: 'intro_accepted', title: 'Introduction Accepted', body: 'Priya Nair accepted your introduction request for the Bandra West mandate', isRead: true, createdAt: hrs(2), actionUrl: '/dashboard/introductions', avatarInitial: 'PN' },
  { id: 'n5', type: 'new_mandate', title: 'New Mandate in Your Circle', body: '3 new mandates posted in BKC Circle matching your buyer profile', isRead: true, createdAt: days(1), actionUrl: '/dashboard/circles/bkc', avatarInitial: 'BK' },
  { id: 'n6', type: 'verification_update', title: 'Document Under Review', body: 'Your PAN card has been submitted and is now under review. Expected: 1–2 business days', isRead: true, createdAt: days(2), actionUrl: '/dashboard/kyc', avatarInitial: 'CO' },
  { id: 'n7', type: 'new_follower', title: 'New Connection Request', body: 'Vijay Kulkarni (Bricks Beyond, Pune) wants to connect with you', isRead: true, createdAt: days(2), actionUrl: '/dashboard/connections', avatarInitial: 'VK' },
  { id: 'n8', type: 'deal_stage_update', title: 'Deal Closed — Congratulations!', body: 'Deal #87 with Vijay Kulkarni has been marked as Registration. Commission split confirmed.', isRead: true, createdAt: days(3), actionUrl: '/dashboard/deals', avatarInitial: 'VK' },
  { id: 'n9', type: 'mandate_expiring', title: 'Mandate Expiring Soon', body: 'Your Powai Commercial mandate expires in 7 days. Renew to keep it active.', isRead: true, createdAt: days(4), actionUrl: '/dashboard/mandates', avatarInitial: 'CO' },
  { id: 'n10', type: 'new_introduction', title: 'Introduction Request', body: 'Sneha Joshi (Realty Pulse) requested an introduction to your Andheri Lease mandate', isRead: true, createdAt: days(5), actionUrl: '/dashboard/introductions', avatarInitial: 'SJ' },
]

