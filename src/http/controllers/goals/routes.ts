import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { remove } from './delete'
import { list } from './list'
import { update } from './update'
import { updateProgress } from './update-progress'
import { cancel } from './cancel'

export async function goalsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/goals', list)
  app.post('/goals', create)
  app.patch('/goals/:id', update)
  app.delete('/goals/:id', remove)

  app.patch('/goals/:id/progress', updateProgress)
  app.patch('/goals/:id/cancel', cancel)
}
