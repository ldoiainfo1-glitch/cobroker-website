import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path })
  const status = (err as any).status ?? 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
}
