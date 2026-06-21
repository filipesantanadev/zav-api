import type { FastifyInstance } from 'fastify'
import { health } from './health'
import { getHealthSchema } from '@/http/schemas/health'

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: getHealthSchema,
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    },
    health,
  )
}
