import { makeDeleteGoalUseCase } from '@/use-cases/factories/goals/make-delete-goal-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteGoalParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const deleteGoalUseCase = makeDeleteGoalUseCase()

  const { id } = deleteGoalParamsSchema.parse(request.params)

  await deleteGoalUseCase.execute({
    id,
    userId: request.user.sub,
  })

  return reply.status(204).send()
}
