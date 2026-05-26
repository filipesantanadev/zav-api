import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { list } from './list'
import { remove } from './delete'
import {
  createCategorySchema,
  deleteCategorySchema,
  listCategoriesSchema,
} from '@/http/schemas/categories'

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/categories', { schema: listCategoriesSchema }, list)
  app.post('/categories', { schema: createCategorySchema }, create)
  app.delete('/categories/:id', { schema: deleteCategorySchema }, remove)
}
