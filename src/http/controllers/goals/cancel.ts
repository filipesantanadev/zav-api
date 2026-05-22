import { goalPresenter } from '@/http/presenters/goal-presenter'
import { makeCancelGoalUseCase } from '@/use-cases/factories/goals/make-cancel-goal-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function cancel(request: FastifyRequest, reply: FastifyReply) {
  const cancelGoalParamsSchema = z.object({
    id: z.string().uuid(''),
  })

  const cancelGoalUseCase = makeCancelGoalUseCase()

  const { id } = cancelGoalParamsSchema.parse(request.params)

  const { goal } = await cancelGoalUseCase.execute({
    goalId: id,
    userId: request.user.sub,
  })

  return reply.status(200).send({
    goal: goalPresenter(goal),
  })
}
