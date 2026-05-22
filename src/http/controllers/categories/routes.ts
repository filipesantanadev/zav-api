import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { list } from './list'
import { remove } from './delete'

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/categories', list)
  app.post('/categories', create)
  app.delete('/categories/:id', remove)
}
