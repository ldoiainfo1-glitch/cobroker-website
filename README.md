# COBROKINGS

COBROKINGS is India's co-broking network for verified real estate brokers.

The React/Vite frontend now lives in `frontend/`. Supabase migrations, seed data, and Edge Functions stay at the repository root under `supabase/`.

## Project Structure

```text
frontend/          React + Vite frontend app
supabase/          Database migrations, seed data, and Edge Functions
docs/              Product and technical documentation
package.json       Root convenience scripts that forward into frontend/
```

## Tech Stack

- React 19 + TypeScript + Vite
- React Router 7
- TanStack React Query
- Zustand
- Supabase Auth + PostgreSQL
- AWS S3 uploads through a Supabase Edge Function
- Tailwind CSS v4 + local UI components

## Local Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=COBROKINGS
VITE_APP_URL=http://localhost:5173
VITE_AWS_REGION=ap-south-1
VITE_AWS_S3_BUCKET=your-s3-bucket-name
VITE_AWS_CLOUDFRONT_URL=
```

Do not put AWS access keys in `.env.local`. Browser env values are public.

4. Start development server:

```bash
npm run dev
```

From the repository root, these convenience scripts also work:

```bash
npm run dev
npm run build
npm run lint
```

## Supabase Setup

The current active schema lives in:

```text
supabase/migrations/001_initial_schema.sql
supabase/seed.sql
```

Run both in Supabase SQL Editor for a fresh project:

1. Run `001_initial_schema.sql`
2. Run `seed.sql`

The frontend expects the current active tables only: profiles, companies, mandates, mandate media, circles, circle members, notifications, conversations/messages, KYC documents, and property categories.

## AWS S3 Upload Setup

Uploads are handled with this flow:

1. Browser asks Supabase Edge Function `get-upload-url` for a presigned URL.
2. Edge Function verifies the logged-in user.
3. Edge Function uses private AWS credentials stored as Supabase secrets.
4. Browser uploads the file directly to S3 using the short-lived presigned URL.
5. Frontend stores the public URL in Supabase.

Set server-side secrets in Supabase:

```bash
npx supabase secrets set AWS_ACCESS_KEY_ID=your_access_key AWS_SECRET_ACCESS_KEY=your_secret_key AWS_S3_BUCKET=your-s3-bucket-name AWS_REGION=ap-south-1 --project-ref ltdjflgoqfmvljiujpct
```

Deploy the Edge Function:

```bash
npx supabase functions deploy get-upload-url --project-ref ltdjflgoqfmvljiujpct
```

Configure S3 bucket CORS to allow local development and production frontend origins. For local testing:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Current Frontend Status

Live Supabase-backed flows:

- Authentication: login, register, logout, session restore
- Marketplace mandate list
- My mandates list and delete
- Post mandate create flow
- Dashboard stats from mandates
- Circles list, join, and leave
- Notifications list, mark read, and mark all read
- KYC document list and AWS S3-backed upload

Still mock, placeholder, or partial:

- Mandate detail page
- Circle detail page: posts, members, leaderboard, heatmap
- Chat conversations and messages
- Broker profile and profile social data: reviews, endorsements, connections
- Company profile team/reviews/documents
- Admin dashboard/users/companies/mandates
- Forgot password submit action
- Analytics page

## Checks

```bash
cd frontend
npm run build
npm run lint
```

Use `npm run build` before pushing frontend changes. It runs TypeScript build plus Vite build.
