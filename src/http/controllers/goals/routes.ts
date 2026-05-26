import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { remove } from './delete'
import { list } from './list'
import { update } from './update'
import { updateProgress } from './update-progress'
import { cancel } from './cancel'
import {
  cancelGoalSchema,
  createGoalSchema,
  deleteGoalSchema,
  listGoalsSchema,
  updateGoalProgressSchema,
  updateGoalSchema,
} from '@/http/schemas/goals'

export async function goalsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/goals', { schema: listGoalsSchema }, list)
  app.post('/goals', { schema: createGoalSchema }, create)
  app.patch('/goals/:id', { schema: updateGoalSchema }, update)
  app.delete('/goals/:id', { schema: deleteGoalSchema }, remove)

  app.patch(
    '/goals/:id/progress',
    { schema: updateGoalProgressSchema },
    updateProgress,
  )
  app.patch('/goals/:id/cancel', { schema: cancelGoalSchema }, cancel)
}
