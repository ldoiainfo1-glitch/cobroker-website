/**
 * Supabase Edge Function — get-download-url
 *
 * Generates a presigned S3 GET URL for private documents (kyc-documents, deal-documents).
 * Only the document owner or a super_admin can request a signed URL.
 *
 * Deploy:
 *   supabase functions deploy get-download-url
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, GetObjectCommand } from 'npm:@aws-sdk/client-s3@3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3'
import { corsHeaders } from '../_shared/cors.ts'

const PRIVATE_FOLDERS = new Set(['kyc-documents', 'deal-documents'])

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    // ── 1. Authenticate the caller ─────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse and validate the request ──────────────────────────────────
    const body = await req.json().catch(() => null)
    if (!body?.s3Key) return json({ error: 's3Key is required' }, 400)

    const s3Key: string = body.s3Key

    // Validate key structure: {folder}/{user_id}/{filename}
    const parts = s3Key.split('/')
    if (parts.length < 3) return json({ error: 'Invalid s3Key format' }, 400)

    const folder = parts[0]
    const pathUserId = parts[1]

    if (!PRIVATE_FOLDERS.has(folder)) {
      return json({ error: 'Only private folders require signed URLs' }, 400)
    }

    // ── 3. Authorise: owner OR super_admin ─────────────────────────────────
    if (pathUserId !== user.id) {
      // Use service role to bypass RLS for the role check
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'super_admin') {
        return json({ error: 'Forbidden' }, 403)
      }
    }

    // ── 4. Generate presigned GET URL (valid 15 minutes) ───────────────────
    const s3 = new S3Client({
      region: Deno.env.get('AWS_REGION')!,
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    })

    const command = new GetObjectCommand({
      Bucket: Deno.env.get('AWS_S3_BUCKET')!,
      Key: s3Key,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 })

    return json({ signedUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[get-download-url]', message)
    return json({ error: message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
