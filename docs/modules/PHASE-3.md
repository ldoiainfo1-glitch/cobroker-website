# Phase 3 — Marketplace
## Modules: Property Mandates · Marketplace Feed · Advanced Search
**Sprints:** 6–8 | **Priority:** ⭐⭐⭐⭐⭐ Core

---

## Overview

Phase 3 is the heart of COBROKINGS. This is where verified brokers post their property mandates (buy/sell/lease requirements), and other brokers discover them to co-broke. The marketplace is the primary daily-use feature driving all engagement.

**Input:** Completed Phase 2 (verified company profiles)  
**Output:** Full mandate creation workflow, live marketplace with filters, map view, saved searches

---

## Module 10 — Property Mandates

### Mandate Types

| Type | Description | Example |
|------|-------------|---------|
| `buy` | Client wants to buy a property | "Looking for 3BHK in Bandra, budget ₹2Cr" |
| `sell` | Client has property to sell | "3BHK in Powai for sale at ₹1.8Cr" |
| `lease` | Client wants to lease or has property to lease | "Commercial space in BKC for lease" |
| `joint_venture` | Partnership on a project | "Land owner looking for developer in Pune" |
| `investment` | Investment opportunity | "Commercial property in Gurugram, 8% yield" |

### Mandate Creation — 6 Steps

```
Step 1 — Type & Category
  Mandate Type (Buy/Sell/Lease/JV/Investment)
  Property Category (Residential/Commercial/Industrial/Land)
  Property Sub-type (Apartment/Villa/Office/Warehouse...)

Step 2 — Property Details
  Title, Description
  Bedrooms/Bathrooms (residential)
  Carpet/Built-up/Plot area + unit
  Floor, Total Floors
  Age of property (sell/lease)
  Amenities (multi-select)
  Furnishing status

Step 3 — Budget & Terms
  Min/Max Budget or Fixed Price
  Negotiable toggle
  Commission % (brokerage)
  Deal timeline (when to close by)
  Key conditions / terms

Step 4 — Location
  City, State
  Microlocations (multiple tags — "Andheri West, Versova")
  Map pin (optional, for sell/lease)
  Nearby landmarks

Step 5 — Media
  Images (up to 20, drag to reorder)
  Documents (floor plan, brochure, title docs)
  Video link (YouTube/Vimeo URL)

Step 6 — Preview & Publish
  Full preview of the mandate card
  Save as Draft OR Publish
  Expiry date selection
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 10.1 | Convert `list-property.html` to React wizard | 5h | Phase 1 |
| 10.2 | Step 1 — Type & Category selection UI | 2h | 10.1 |
| 10.3 | Step 2 — Property Details form | 3h | 10.1 |
| 10.4 | Step 3 — Budget & Terms form | 2h | 10.1 |
| 10.5 | Step 4 — Location with map pin (Leaflet) | 4h | 10.1 |
| 10.6 | Step 5 — Multi-image upload with drag reorder | 4h | 10.1 |
| 10.7 | Step 5 — Document upload | 2h | 10.6 |
| 10.8 | Step 6 — Preview screen with mandate card | 2h | 10.1 |
| 10.9 | Save as Draft + Publish actions | 2h | 10.8 |
| 10.10 | My Mandates list page (dashboard) | 2h | Phase 1 |
| 10.11 | Mandate status controls (Publish, Close, Delete) | 2h | 10.10 |
| 10.12 | Mandate analytics (views, intros count) | 2h | 10.10 |
| 10.13 | Mandate detail page (full view) | 3h | 10.1 |
| 10.14 | Edit mandate (load existing data into wizard) | 3h | 10.9 |
| 10.15 | Mandate expiry auto-close (cron job) | 2h | Phase 0 |
| 10.16 | API — POST /api/mandates | 3h | Phase 1 |
| 10.17 | API — GET/PUT/DELETE /api/mandates/:id | 2h | 10.16 |
| 10.18 | API — POST /api/mandates/:id/images | 2h | 10.16 |
| 10.19 | Image upload to Supabase Storage | 2h | 10.18 |
| 10.20 | Write mandate CRUD tests | 3h | 10.16 |

### Database

```sql
-- From TRD: mandates, mandate_images, mandate_documents tables

-- Mandate Analytics (track per-mandate views)
CREATE TABLE mandate_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id),
  viewer_id UUID REFERENCES users(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Mandate Card Component

```typescript
interface MandateCard {
  id: string;
  title: string;
  type: 'buy' | 'sell' | 'lease' | 'joint_venture' | 'investment';
  category: string;
  budgetMin: number;
  budgetMax: number;
  area: number;
  areaUnit: string;
  city: string;
  locations: string[];    // micro-locations
  images: string[];
  postedBy: {
    name: string;
    avatar: string;
    company: string;
    verified: boolean;
  };
  viewsCount: number;
  introCount: number;
  status: 'draft' | 'active' | 'closed' | 'expired';
  createdAt: string;
  expiresAt: string;
}
```

### Acceptance Criteria
- [ ] All 5 mandate types can be created
- [ ] Images upload with preview and drag-to-reorder
- [ ] Map pin can be placed on the location
- [ ] Draft can be saved and resumed
- [ ] Mandate publishes and appears in marketplace within 30 seconds
- [ ] Mandate expires automatically at `expiresAt` date
- [ ] Views count increments on each unique view

---

## Module 11 — Marketplace

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR: Search | Filter Toggle | Sort | View (Grid/Map) │
├────────────┬────────────────────────────────────────────┤
│            │                                             │
│  FILTER    │  MANDATE CARDS GRID                        │
│  SIDEBAR   │                                             │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  Type      │  │ Card 1   │ │ Card 2   │ │ Card 3   │   │
│  Budget    │  └──────────┘ └──────────┘ └──────────┘   │
│  Area      │                                             │
│  City      │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  State     │  │ Card 4   │ │ Card 5   │ │ Card 6   │   │
│  Posted    │  └──────────┘ └──────────┘ └──────────┘   │
│  by        │                                             │
│  Verified  │  [ Load More ]                              │
│  only      │                                             │
└────────────┴────────────────────────────────────────────┘
```

### Filter Options

```typescript
interface MarketplaceFilters {
  q?: string;               // keyword search
  type?: MandateType[];     // buy, sell, lease, jv, investment
  category?: string[];      // residential, commercial, etc.
  budgetMin?: number;
  budgetMax?: number;
  areaMin?: number;
  areaMax?: number;
  areaUnit?: 'sqft' | 'sqm';
  city?: string[];
  state?: string[];
  locations?: string[];
  verifiedOnly?: boolean;
  postedAfter?: Date;
  sortBy?: 'newest' | 'budget_asc' | 'budget_desc' | 'area';
  page?: number;
  limit?: number;
}
```

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 11.1 | Convert `marketplace.html` → full React page | 4h | Phase 1 |
| 11.2 | Mandate card component (reusable) | 2h | 11.1 |
| 11.3 | Filter sidebar — all filter controls | 4h | 11.1 |
| 11.4 | Sort controls | 1h | 11.1 |
| 11.5 | Grid / List view toggle | 1h | 11.1 |
| 11.6 | Infinite scroll with React Query | 3h | 11.1 |
| 11.7 | Map view (Leaflet) with mandate pins | 5h | 11.1 |
| 11.8 | Map cluster for dense areas | 2h | 11.7 |
| 11.9 | Mandate popup on map pin click | 2h | 11.7 |
| 11.10 | Save mandate (bookmark) | 2h | 11.2 |
| 11.11 | Saved mandates page | 2h | 11.10 |
| 11.12 | Save current search as named filter | 2h | 11.3 |
| 11.13 | Saved searches page with notifications toggle | 2h | 11.12 |
| 11.14 | API — GET /api/mandates (marketplace) | 3h | 10.16 |
| 11.15 | API — GET /api/mandates/saved | 2h | 11.14 |
| 11.16 | Share mandate (copy link) | 1h | 11.2 |

### Performance

- Marketplace query must use database indexes on: `status`, `city`, `type`, `budget_max`, `created_at`
- Implement cursor-based pagination (not offset) for consistent results
- Cache popular city feeds for 60 seconds in Redis

### Acceptance Criteria
- [ ] Marketplace loads within 1.5s (first 20 results)
- [ ] All filter combinations work correctly
- [ ] Map view shows mandate pins with clustering
- [ ] Infinite scroll loads next page automatically
- [ ] Saved mandates persist across sessions
- [ ] Save search creates a notification subscription

---

## Module 12 — Advanced Search

### Search Capabilities

| Feature | Description | Phase |
|---------|-------------|-------|
| Full-text search | Search title, description, location tags | Phase 3 |
| City / State filter | Dropdown + multi-select | Phase 3 |
| Polygon search | Draw area on map | Phase 3 |
| Radius search | "Within X km of a point" | Phase 3 |
| Budget range slider | Min/max budget | Phase 3 |
| AI search | Natural language → structured query | Phase 9 |
| Saved filters | Named saved search configs | Phase 3 |

### Tasks

| # | Task | Effort | Depends On |
|---|------|--------|-----------|
| 12.1 | Full-text search on mandate title+description | 2h | 11.14 |
| 12.2 | PostgreSQL GIN index for full-text search | 1h | 12.1 |
| 12.3 | Enable PostGIS extension on Supabase | 1h | Phase 0 |
| 12.4 | Store lat/lng on mandates (sell/lease) | 1h | 10.5 |
| 12.5 | Radius search API filter (ST_DWithin) | 3h | 12.3 |
| 12.6 | Polygon search API filter (ST_Within) | 3h | 12.3 |
| 12.7 | Draw polygon on map (Leaflet.draw) | 4h | 11.7 |
| 12.8 | Radius circle selector on map | 2h | 11.7 |

### SQL — Full-Text Search

```sql
-- Add full-text search column
ALTER TABLE mandates ADD COLUMN fts_vector tsvector;

CREATE INDEX mandates_fts_idx ON mandates USING GIN(fts_vector);

-- Update trigger
CREATE FUNCTION update_mandate_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_vector = to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Radius search query
SELECT * FROM mandates
WHERE ST_DWithin(
  geography(ST_MakePoint(longitude, latitude)),
  geography(ST_MakePoint($1, $2)),  -- user's center point
  $3 * 1000  -- radius in meters
);
```

### Acceptance Criteria
- [ ] Full-text search returns results within 500ms
- [ ] Radius search works with km selector (1, 5, 10, 25 km)
- [ ] Polygon draw allows custom area selection
- [ ] Results update immediately when search criteria changes
