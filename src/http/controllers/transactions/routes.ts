import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { remove } from './delete'
import { update } from './update'
import { search } from './search'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/transactions', search)
  app.post('/transactions', create)
  app.patch('/transactions/:id', update)
  app.delete('/transactions/:id', remove)
}
