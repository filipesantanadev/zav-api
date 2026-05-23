import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { getDashboard } from './get-dashboard'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/dashboard', getDashboard)
}
