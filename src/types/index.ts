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

// Introductions
export interface Introduction {
  id: string
  mandateId: string
  mandate?: Mandate
  requesterId: string
  requester?: User
  responderId: string
  responder?: User
  requesterCompany?: Company
  responderCompany?: Company
  status: IntroductionStatus
  message?: string
  rejectionReason?: string
  respondedAt?: string
  createdAt: string
}

export type IntroductionStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed'

// Deals
export interface Deal {
  id: string
  introductionId?: string
  mandateId?: string
  mandate?: Mandate
  title: string
  stage: DealStage
  propertyAddress?: string
  dealValue?: number
  brokeragePercentage?: number
  commissionSplitBroker1?: number
  commissionSplitBroker2?: number
  broker1?: User
  broker2?: User
  company1?: Company
  company2?: Company
  expectedCloseDate?: string
  actualCloseDate?: string
  notes?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type DealStage =
  | 'lead' | 'introduction' | 'meeting'
  | 'site_visit' | 'negotiation' | 'token'
  | 'agreement' | 'registration' | 'completed'

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
  | 'new_mandate' | 'new_introduction' | 'intro_accepted'
  | 'intro_rejected' | 'new_message' | 'deal_stage_update'
  | 'verification_update' | 'payment_success' | 'mandate_expiring'
  | 'new_follower' | 'system'

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
  avgRating: number
  totalConnections: number
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
  status: KYCDocStatus
  rejectionReason?: string
  uploadedAt?: string
  reviewedAt?: string
}

