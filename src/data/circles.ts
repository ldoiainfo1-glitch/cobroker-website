import type { Circle, CircleMember, CirclePost, LeaderboardEntry } from '@/types'

export const MOCK_CIRCLES: Circle[] = [
  // Mumbai Area circles
  { id: 'bandra-west', name: 'Bandra West', slug: 'bandra-west', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Residential', 'Commercial'], membersCount: 284, postsCount: 1240, dealsCount: 87, isJoined: true, createdAt: '2024-01-01' },
  { id: 'worli', name: 'Worli', slug: 'worli', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Residential', 'Commercial'], membersCount: 196, postsCount: 890, dealsCount: 62, isJoined: true, createdAt: '2024-01-01' },
  { id: 'lower-parel', name: 'Lower Parel', slug: 'lower-parel', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Commercial', 'Residential'], membersCount: 312, postsCount: 1560, dealsCount: 94, isJoined: false, isFeatured: true, createdAt: '2024-01-01' },
  { id: 'bkc', name: 'BKC', slug: 'bkc', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Commercial', 'Retail'], membersCount: 445, postsCount: 2100, dealsCount: 156, isJoined: true, isFeatured: true, createdAt: '2024-01-01' },
  { id: 'andheri-west', name: 'Andheri West', slug: 'andheri-west', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Residential'], membersCount: 523, postsCount: 3200, dealsCount: 218, isJoined: false, createdAt: '2024-01-01' },
  { id: 'powai', name: 'Powai', slug: 'powai', scope: 'area', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Residential', 'Commercial'], membersCount: 267, postsCount: 1100, dealsCount: 71, isJoined: false, createdAt: '2024-01-01' },
  // Mumbai City circles
  { id: 'mumbai-city', name: 'Mumbai City', slug: 'mumbai-city', scope: 'city', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Residential', 'Commercial', 'Industrial'], membersCount: 2840, postsCount: 18400, dealsCount: 1240, isJoined: true, createdAt: '2024-01-01' },
  { id: 'mumbai-commercial', name: 'Mumbai Commercial', slug: 'mumbai-commercial', scope: 'city', city: 'Mumbai', state: 'Maharashtra', assetClasses: ['Commercial', 'Retail'], membersCount: 890, postsCount: 5600, dealsCount: 380, isJoined: false, createdAt: '2024-01-01' },
  // Bengaluru
  { id: 'whitefield', name: 'Whitefield', slug: 'whitefield', scope: 'area', city: 'Bengaluru', state: 'Karnataka', assetClasses: ['Residential', 'Commercial'], membersCount: 398, postsCount: 2400, dealsCount: 132, isJoined: false, createdAt: '2024-01-01' },
  { id: 'indiranagar', name: 'Indiranagar', slug: 'indiranagar', scope: 'area', city: 'Bengaluru', state: 'Karnataka', assetClasses: ['Residential', 'Retail'], membersCount: 341, postsCount: 1800, dealsCount: 98, isJoined: false, createdAt: '2024-01-01' },
  { id: 'hsr-layout', name: 'HSR Layout', slug: 'hsr-layout', scope: 'area', city: 'Bengaluru', state: 'Karnataka', assetClasses: ['Residential'], membersCount: 256, postsCount: 1200, dealsCount: 74, isJoined: false, createdAt: '2024-01-01' },
  { id: 'bengaluru-city', name: 'Bengaluru City', slug: 'bengaluru-city', scope: 'city', city: 'Bengaluru', state: 'Karnataka', assetClasses: ['Residential', 'Commercial', 'Land'], membersCount: 1920, postsCount: 12000, dealsCount: 820, isJoined: false, createdAt: '2024-01-01' },
  // Delhi NCR
  { id: 'cyber-city', name: 'Cyber City Gurgaon', slug: 'cyber-city', scope: 'area', city: 'Gurgaon', state: 'Haryana', assetClasses: ['Commercial', 'Residential'], membersCount: 412, postsCount: 2800, dealsCount: 165, isJoined: false, createdAt: '2024-01-01' },
  { id: 'delhi-ncr', name: 'Delhi NCR', slug: 'delhi-ncr', scope: 'city', city: 'Delhi NCR', state: 'Delhi', assetClasses: ['Residential', 'Commercial', 'Industrial'], membersCount: 1640, postsCount: 9800, dealsCount: 680, isJoined: false, createdAt: '2024-01-01' },
  // Pune
  { id: 'koregaon-park', name: 'Koregaon Park', slug: 'koregaon-park', scope: 'area', city: 'Pune', state: 'Maharashtra', assetClasses: ['Residential', 'Retail'], membersCount: 198, postsCount: 980, dealsCount: 54, isJoined: false, createdAt: '2024-01-01' },
  { id: 'hinjewadi', name: 'Hinjewadi', slug: 'hinjewadi', scope: 'area', city: 'Pune', state: 'Maharashtra', assetClasses: ['Commercial', 'Residential'], membersCount: 287, postsCount: 1400, dealsCount: 89, isJoined: false, createdAt: '2024-01-01' },
  // National asset class circles
  { id: 'national-warehousing', name: 'National Warehousing', slug: 'national-warehousing', scope: 'national', assetClasses: ['Industrial'], membersCount: 640, postsCount: 3200, dealsCount: 210, isJoined: false, description: 'Pan-India industrial & warehousing mandates', createdAt: '2024-01-01' },
  { id: 'national-land', name: 'National Land & Plots', slug: 'national-land', scope: 'national', assetClasses: ['Land'], membersCount: 780, postsCount: 4100, dealsCount: 290, isJoined: false, description: 'Land parcels, plotted developments, agricultural land', createdAt: '2024-01-01' },
  { id: 'national-hospitality', name: 'National Hospitality', slug: 'national-hospitality', scope: 'national', assetClasses: ['Hospitality'], membersCount: 210, postsCount: 890, dealsCount: 42, isJoined: false, description: 'Hotels, resorts, service apartments nationwide', createdAt: '2024-01-01' },
]

export const MOCK_MEMBERS: CircleMember[] = [
  { id: '1', name: 'Vikram Shah', company: 'Mahindra Lifespaces', city: 'Mumbai', verified: true, tier: 'verified_plus', rating: 4.9, reviewCount: 38, dealsCount: 24, joinedAt: '2024-01-15', avatarInitial: 'V' },
  { id: '2', name: 'Priya Nair', company: 'Prestige Estates', city: 'Mumbai', verified: true, tier: 'pro', rating: 4.7, reviewCount: 22, dealsCount: 15, joinedAt: '2024-02-01', avatarInitial: 'P' },
  { id: '3', name: 'Rahul Mehta', company: 'Oberoi Realty', city: 'Mumbai', verified: true, tier: 'enterprise', rating: 4.8, reviewCount: 51, dealsCount: 34, joinedAt: '2024-01-08', avatarInitial: 'R' },
  { id: '4', name: 'Anita Desai', company: 'JLL India', city: 'Mumbai', verified: true, tier: 'verified_plus', rating: 4.6, reviewCount: 18, dealsCount: 12, joinedAt: '2024-03-10', avatarInitial: 'A' },
  { id: '5', name: 'Suresh Joshi', company: 'Kolte Patil', city: 'Pune', verified: false, tier: 'pro', rating: 4.4, reviewCount: 9, dealsCount: 7, joinedAt: '2024-04-01', avatarInitial: 'S' },
  { id: '6', name: 'Meera Kapoor', company: 'DLF Commercial', city: 'Mumbai', verified: true, tier: 'pro', rating: 4.5, reviewCount: 14, dealsCount: 10, joinedAt: '2024-02-20', avatarInitial: 'M' },
  { id: '7', name: 'Kiran Patel', company: 'Godrej Properties', city: 'Mumbai', verified: true, tier: 'verified_plus', rating: 4.8, reviewCount: 29, dealsCount: 19, joinedAt: '2024-01-25', avatarInitial: 'K' },
  { id: '8', name: 'Deepak Sharma', company: 'Brigade Group', city: 'Bengaluru', verified: false, tier: 'free', rating: 4.2, reviewCount: 5, dealsCount: 3, joinedAt: '2024-05-01', avatarInitial: 'D' },
  { id: '9', name: 'Sunita Rao', company: 'Embassy Group', city: 'Bengaluru', verified: true, tier: 'pro', rating: 4.6, reviewCount: 16, dealsCount: 11, joinedAt: '2024-03-01', avatarInitial: 'S' },
  { id: '10', name: 'Ajay Singhania', company: 'Lodha Group', city: 'Mumbai', verified: true, tier: 'enterprise', rating: 5.0, reviewCount: 44, dealsCount: 28, joinedAt: '2024-01-01', avatarInitial: 'A' },
]

export const MOCK_CIRCLE_POSTS: CirclePost[] = [
  { id: '1', type: 'mandate', author: { name: 'Vikram Shah', company: 'Mahindra Lifespaces', verified: true, tier: 'verified_plus' }, content: 'BUYING · 3BHK in Bandra West or Khar West · ₹2.5–3.5 Cr · HNI buyer ready, possession in 60 days. Co-broke welcome.', mandateType: 'buy', budget: '₹2.5–3.5 Cr', location: 'Bandra West', postedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), views: 84, intros: 6 },
  { id: '2', type: 'deal_closed', author: { name: 'Priya Nair', company: 'Prestige Estates', verified: true, tier: 'pro' }, content: '🎉 Deal closed! 3 BHK · Bandra West · 3–4 Cr · Co-broked with Rahul Mehta. Great partnership!', postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), views: 210, intros: 0 },
  { id: '3', type: 'mandate', author: { name: 'Rahul Mehta', company: 'Oberoi Realty', verified: true, tier: 'enterprise' }, content: 'SELLING · Sea-view penthouse in Worli · ₹28 Cr · 4,500 sqft · Exclusive mandate. Looking for serious buyers only.', mandateType: 'sell', budget: '₹28 Cr', location: 'Worli', postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), views: 340, intros: 14 },
  { id: '4', type: 'mandate', author: { name: 'Anita Desai', company: 'JLL India', verified: true, tier: 'verified_plus' }, content: 'LEASING · Grade A office space in BKC · ₹9,500–11,000/sqft · 20,000–30,000 sqft · Corporate client, immediate occupancy.', mandateType: 'lease', budget: '₹9,500–11,000/sqft', location: 'BKC', postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), views: 178, intros: 8 },
  { id: '5', type: 'announcement', author: { name: 'Meera Kapoor', company: 'DLF Commercial', verified: true, tier: 'pro' }, content: 'Hosting a co-broking roundtable at DLF office this Saturday, 11 AM. 15 seats. DM to confirm. Agenda: commission structures & intro etiquette.', postedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), views: 124, intros: 0 },
  { id: '6', type: 'mandate', author: { name: 'Kiran Patel', company: 'Godrej Properties', verified: true, tier: 'verified_plus' }, content: 'INVESTMENT · Commercial yield property in Lower Parel · ₹8–12 Cr · 7.5% guaranteed rental yield · IPC client.', mandateType: 'investment', budget: '₹8–12 Cr', location: 'Lower Parel', postedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), views: 267, intros: 11 },
]

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, prevRank: 2, member: MOCK_MEMBERS[9], score: 94, posts: 12, reviews: 8, deals: 5 },
  { rank: 2, prevRank: 1, member: MOCK_MEMBERS[0], score: 88, posts: 10, reviews: 6, deals: 4 },
  { rank: 3, prevRank: 3, member: MOCK_MEMBERS[2], score: 82, posts: 8, reviews: 7, deals: 3 },
  { rank: 4, prevRank: 6, member: MOCK_MEMBERS[6], score: 74, posts: 7, reviews: 4, deals: 3 },
  { rank: 5, prevRank: 4, member: MOCK_MEMBERS[1], score: 68, posts: 6, reviews: 5, deals: 2 },
  { rank: 6, prevRank: 5, member: MOCK_MEMBERS[3], score: 61, posts: 5, reviews: 4, deals: 2 },
  { rank: 7, prevRank: 9, member: MOCK_MEMBERS[5], score: 54, posts: 6, reviews: 3, deals: 1 },
  { rank: 8, prevRank: 7, member: MOCK_MEMBERS[8], score: 47, posts: 4, reviews: 3, deals: 2 },
  { rank: 9, prevRank: 8, member: MOCK_MEMBERS[4], score: 38, posts: 3, reviews: 2, deals: 1 },
  { rank: 10, prevRank: 11, member: MOCK_MEMBERS[7], score: 24, posts: 2, reviews: 1, deals: 0 },
]
