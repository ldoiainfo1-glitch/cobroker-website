// Core user types
export interface User {
  id: string
  email: string
  phone?: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  companyId?: string
  company?: Company
  isVerified: boolean
  isActive: boolean
  lastSeenAt?: string
  createdAt: string
  // Extended profile fields
  bio?: string
  yearsOfExperience?: number
  specializations?: string[]
  areas?: string[]
  languages?: string[]
  linkedinUrl?: string
  websiteUrl?: string
}

export type UserRole = 'super_admin' | 'company_admin' | 'director' | 'broker' | 'employee' | 'viewer'

// Company
export interface Company {
  id: string
  name: string
  slug: string
  logoUrl?: string
  coverUrl?: string
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city: string
  state: string
  pincode?: string
  reraNumber?: string
  gstNumber?: string
  panNumber?: string
  verificationStatus: VerificationStatus
  isActive: boolean
  createdAt: string
  membersCount?: number
  mandatesCount?: number
}

export type VerificationStatus = 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected'

// Auth
export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  phone: string
  fullName: string
  password: string
  companyName: string
  companyCity: string
  companyState: string
}

// Mandates
export interface Mandate {
  id: string
  title: string
  description?: string
  mandateType: MandateType
  propertyType: PropertyType
  category?: string
  minBudget?: number
  maxBudget?: number
  minArea?: number
  maxArea?: number
  areaUnit?: string
  city: string
  state: string
  locations?: string[]
  latitude?: number
  longitude?: number
  tags?: string[]
  status: MandateStatus
  expiresAt?: string
  viewsCount: number
  introCount: number
  images: MandateImage[]
  postedBy: User
  company: Company
  createdAt: string
  updatedAt: string
}

export type MandateType = 'buy' | 'sell' | 'lease' | 'joint_venture' | 'investment'
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'land' | 'agricultural'
export type MandateStatus = 'draft' | 'active' | 'closed' | 'expired'

export interface MandateImage {
  id: string
  url: string
  isPrimary: boolean
  sortOrder: number
}

// Notifications
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  createdAt: string
}

export type NotificationType =
  | 'new_mandate' | 'new_message'
  | 'new_introduction' | 'intro_accepted' | 'intro_rejected'
  | 'deal_stage_update' | 'new_follower'
  | 'verification_update' | 'payment_success' | 'mandate_expiring'
  | 'system'

// API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

// Marketplace filters
export interface MarketplaceFilters {
  q?: string
  type?: MandateType[]
  propertyType?: PropertyType[]
  budgetMin?: number
  budgetMax?: number
  city?: string[]
  state?: string[]
  verifiedOnly?: boolean
  sortBy?: 'newest' | 'budget_asc' | 'budget_desc'
  page?: number
  limit?: number
}

// ─── Circles ────────────────────────────────────────────────────────────────
export type CircleScope = 'area' | 'city' | 'state' | 'national'

export interface Circle {
  id: string
  name: string
  slug: string
  scope: CircleScope
  city?: string
  state?: string
  assetClasses: string[]
  description?: string
  membersCount: number
  postsCount: number
  dealsCount: number
  isJoined: boolean
  isFeatured?: boolean
  createdAt: string
}

export interface CircleMember {
  id: string
  name: string
  company: string
  city: string
  verified: boolean
  tier: 'free' | 'pro' | 'verified_plus' | 'enterprise'
  rating: number
  reviewCount: number
  dealsCount: number
  joinedAt: string
  avatarInitial: string
}

export interface CirclePost {
  id: string
  type: 'mandate' | 'announcement' | 'deal_closed'
  author: { name: string; company: string; verified: boolean; tier: string }
  content: string
  mandateType?: MandateType
  budget?: string
  location?: string
  postedAt: string
  views: number
  intros: number
}

export interface LeaderboardEntry {
  rank: number
  prevRank: number
  member: CircleMember
  score: number
  posts: number
  reviews: number
  deals: number
}

// ─── Profile & Trust (Phase 3) ───────────────────────────────────────────────
export type BrokerTier = 'free' | 'pro' | 'verified_plus' | 'enterprise'

export interface BrokerProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  avatarInitial: string
  avatarUrl?: string
  company: string
  companyId: string
  city: string
  state: string
  bio: string
  specializations: string[]
  areas: string[]
  languages: string[]
  yearsOfExperience: number
  totalDeals: number
  totalMandates: number
  totalReviews: number
  avgRating?: number
  tier: BrokerTier
  completenessScore: number       // 0–100
  badges: ProfileBadge[]
  socialLinks: { linkedin?: string; website?: string }
  isVerified: boolean
  isConnected?: boolean
  createdAt: string
}

export type ProfileBadge =
  | 'top_closer'       // 10+ closed deals
  | 'trusted_broker'   // 50+ verified reviews
  | 'circle_leader'    // Top 3 in any circle leaderboard
  | 'speed_king'       // Average deal < 30 days
  | 'multi_city'       // Active in 3+ cities
  | 'rera_verified'    // RERA uploaded & approved
  | 'early_adopter'    // Joined first 500

export interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerCompany: string
  reviewerAvatarInitial: string
  revieweeId: string
  dealId?: string
  rating: number
  title: string
  body: string
  tags: ReviewTag[]
  ownerResponse?: string
  createdAt: string
}

export type ReviewTag =
  | 'fast_responder' | 'professional' | 'deal_closer'
  | 'honest' | 'knowledgeable' | 'great_communicator'

export interface Endorsement {
  id: string
  endorserId: string
  endorserName: string
  endorserCompany: string
  endorserAvatarInitial: string
  skill: string
  count: number
  endorsedByMe: boolean
}

export interface Connection {
  id: string
  brokerId: string
  fullName: string
  company: string
  city: string
  tier: BrokerTier
  isVerified: boolean
  avgRating: number
  mutualDeals: number
  avatarInitial: string
  connectedAt: string
  isFollowing: boolean
}

// KYC / Verification
export type KYCDocType = 'rera' | 'gst' | 'pan' | 'incorporation' | 'address_proof'
export type KYCDocStatus = 'not_uploaded' | 'pending' | 'under_review' | 'approved' | 'rejected'

export interface KYCDocument {
  id: string
  type: KYCDocType
  label: string
  description: string
  required: boolean
  fileName?: string
  fileSize?: string
  docUrl?: string
  status: KYCDocStatus
  rejectionReason?: string
  uploadedAt?: string
  reviewedAt?: string
}

// ─── Chat & Messaging (Phase 4) ──────────────────────────────────────────────
export type ChatMessageType = 'text' | 'mandate_share' | 'system' | 'deal_update' | 'file'

export interface ConvParticipant {
  id: string
  name: string
  company: string
  avatarInitial: string
  isVerified: boolean
  isOnline: boolean
  lastSeen?: string
}

export interface ChatMandateCard {
  id: string
  title: string
  mandateType: string
  budget: string
  city: string
  propertyType: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderInitial: string
  type: ChatMessageType
  text?: string
  mandateCard?: ChatMandateCard
  fileName?: string
  fileSize?: string
  systemText?: string
  sentAt: string
  isRead: boolean
  isMine: boolean
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  participants: ConvParticipant[]
  lastMessage: string
  lastMessageAt: string
  lastMessageType: ChatMessageType
  unreadCount: number
  isPinned?: boolean
  linkedDealId?: string
  linkedIntroId?: string
  groupName?: string
  groupInitial?: string
}

export interface ChatNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  avatarInitial?: string
}

// ─── Owner Listings (Phase 5) ────────────────────────────────────────────────
export type OwnerListingType = 'sell' | 'rent' | 'lease'
export type OwnerPropertyType = 'apartment' | 'villa' | 'office' | 'shop' | 'plot' | 'warehouse' | 'farmhouse' | 'studio'
export type OwnerListingStatus = 'active' | 'represented' | 'closed'
export type FurnishedStatus = 'furnished' | 'semi-furnished' | 'unfurnished'

export interface OwnerProfile {
  id: string
  displayName: string         // "Rajesh K." — first name + last initial only
  city: string
  state: string
  isVerifiedOwner: boolean
  memberSince: string
  responseTime: string        // "Usually within 2 hours"
  totalListings: number
  avatarInitial: string
}

export interface OwnerListing {
  id: string
  listingType: OwnerListingType
  propertyType: OwnerPropertyType
  title: string
  description: string
  area: number
  areaUnit: 'sqft' | 'sqm' | 'acres'
  floor?: number
  totalFloors?: number
  bedrooms?: number
  bathrooms?: number
  parking?: number
  facing?: string
  ageYears?: number
  furnished?: FurnishedStatus
  amenities: string[]
  askingPrice: number
  priceNegotiable: boolean
  maintenanceCharges?: number
  city: string
  state: string
  locality: string
  landmark?: string
  owner: OwnerProfile
  status: OwnerListingStatus
  claimsCount: number
  claimedByMe: boolean
  claimants: { initial: string; name: string; company: string }[]
  views: number
  isFeatured?: boolean
  isVerifiedListing: boolean
  postedAt: string
  expiresAt: string
}

export interface ListingClaim {
  id: string
  listingId: string
  brokerMessage: string
  status: 'pending' | 'accepted' | 'rejected'
  claimedAt: string
}

