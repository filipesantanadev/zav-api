import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { remove } from './delete'
import { update } from './update'
import { search } from './search'
import {
  createTransactionSchema,
  deleteTransactionSchema,
  fetchTransactionsSchema,
  updateTransactionSchema,
} from '@/http/schemas/transactions'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/transactions', { schema: fetchTransactionsSchema }, search)
  app.post('/transactions', { schema: createTransactionSchema }, create)
  app.patch('/transactions/:id', { schema: updateTransactionSchema }, update)
  app.delete('/transactions/:id', { schema: deleteTransactionSchema }, remove)
}
