/**
 * Supabase Edge Function — get-upload-url
 *
 * Generates a presigned S3 PUT URL so the browser can upload directly to S3
 * without ever seeing AWS credentials.
 *
 * Deploy:
 *   supabase functions deploy get-upload-url
 *
 * Set secrets:
 *   supabase secrets set AWS_ACCESS_KEY_ID=xxx
 *   supabase secrets set AWS_SECRET_ACCESS_KEY=xxx
 *   supabase secrets set AWS_REGION=ap-south-1
 *   supabase secrets set AWS_S3_BUCKET=cobrokings-media
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3'
import { corsHeaders } from '../_shared/cors.ts'

// ─── Allowlists ───────────────────────────────────────────────────────────────

const ALLOWED_FOLDERS = new Set([
  'mandate-images',
  'mandate-documents',
  'avatars',
  'kyc-documents',
  'company-logos',
  'company-covers',
  'deal-documents',
])

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const ALLOWED_DOC_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])

const IMAGE_FOLDERS = new Set([
  'mandate-images',
  'avatars',
  'company-logos',
  'company-covers',
])

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    // ── 1. Authenticate the caller ───────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse + validate request body ────────────────────────────────────
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Invalid JSON body' }, 400)

    const { folder, filename, contentType } = body as {
      folder: string
      filename: string
      contentType: string
    }

    if (!folder || !filename || !contentType) {
      return json({ error: 'folder, filename, and contentType are required' }, 400)
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return json({ error: `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(', ')}` }, 400)
    }

    const allowedTypes = IMAGE_FOLDERS.has(folder) ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES
    if (!allowedTypes.has(contentType)) {
      return json({ error: `Invalid content type for folder "${folder}"` }, 400)
    }

    // Sanitize filename — strip path traversal, keep only safe chars
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
    if (!safeFilename) return json({ error: 'Invalid filename' }, 400)

    // ── 3. Build scoped S3 key  ──────────────────────────────────────────────
    // Pattern: {folder}/{userId}/{timestamp}-{safeFilename}
    // Scoping to userId prevents users from overwriting each other's files.
    const s3Key = `${folder}/${user.id}/${Date.now()}-${safeFilename}`

    // ── 4. Generate presigned PUT URL ────────────────────────────────────────
    const s3 = new S3Client({
      region: Deno.env.get('AWS_REGION')!,
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    })

    const bucket = Deno.env.get('AWS_S3_BUCKET')!

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: contentType,
    })

    // Presigned URL expires in 5 minutes
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    // Public URL — use CloudFront base if set, otherwise S3 direct
    const cdnBase = Deno.env.get('AWS_CLOUDFRONT_URL')
    const publicUrl = cdnBase
      ? `${cdnBase}/${s3Key}`
      : `https://${bucket}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${s3Key}`

    return json({ presignedUrl, publicUrl, s3Key })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[get-upload-url]', message)
    return json({ error: message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
