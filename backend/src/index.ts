import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { logger } from '@/utils/logger'
import { errorHandler, notFound } from '@/middleware/errorHandler'

import authRoutes from '@/routes/auth.routes'
import userRoutes from '@/routes/users.routes'
import mandateRoutes from '@/routes/mandates.routes'
import companyRoutes from '@/routes/companies.routes'
import notificationRoutes from '@/routes/notifications.routes'
import adminRoutes from '@/routes/admin.routes'

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'https://cobrokings.com',
  'https://www.cobrokings.com',
]

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))

// ─── Rate limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
})

app.use('/api/', globalLimiter)
app.use('/api/v1/auth/', authLimiter)

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/mandates', mandateRoutes)
app.use('/api/v1/companies', companyRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/admin', adminRoutes)

// ─── Socket.io (real-time chat placeholder) ───────────────────────────────────

const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
})

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  socket.on('join_room', (roomId: string) => socket.join(roomId))
  socket.on('leave_room', (roomId: string) => socket.leave(roomId))
  socket.on('send_message', (payload) => {
    socket.to(payload.roomId).emit('new_message', payload)
  })
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`))
})

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(notFound)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001')

server.listen(PORT, () => {
  logger.info(`🚀 COBROKINGS API running on port ${PORT}`)
  logger.info(`   ENV: ${process.env.NODE_ENV ?? 'development'}`)
})

export { app, io }
