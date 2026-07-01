import { Request, Response, NextFunction } from 'express'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

/** Verify Supabase JWT and attach userId + role to req */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    logger.warn('Auth failed', { error: error?.message })
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.userId = user.id
  req.userRole = (user.app_metadata?.role as string) ?? 'broker'
  next()
}

/** Only super_admin role allowed */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'super_admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  next()
}
