import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { remove } from './delete'
import { list } from './list'

export async function goalsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/goals', list)
  app.post('/goals', create)
  app.delete('/goals/:id', remove)
}
