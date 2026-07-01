import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { logger } from '@/utils/logger'

const url = process.env.SUPABASE_URL!
const anonKey = process.env.SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !anonKey) {
  logger.error('SUPABASE_URL or SUPABASE_ANON_KEY is missing')
  process.exit(1)
}

const clientOptions = { realtime: { transport: ws } }

/** Standard client — respects RLS */
export const supabase = createClient(url, anonKey, clientOptions)

/** Admin client — bypasses RLS; server-side only */
export const supabaseAdmin = serviceKey
  ? createClient(url, serviceKey, { ...clientOptions, auth: { persistSession: false } })
  : supabase
