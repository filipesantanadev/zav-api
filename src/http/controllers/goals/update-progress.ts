import { goalPresenter } from '@/http/presenters/goal-presenter'
import { makeUpdateGoalProgressUseCase } from '@/use-cases/factories/goals/make-update-goal-progress-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function updateProgress(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateGoalProgressParamsSchema = z.object({
    id: z.string().uuid(''),
  })

  const updateGoalProgressBodySchema = z.object({
    amount: z.number().positive(),
  })

  const updateGoalProgressUseCase = makeUpdateGoalProgressUseCase()

  const { id } = updateGoalProgressParamsSchema.parse(request.params)

  const { amount } = updateGoalProgressBodySchema.parse(request.body)

  const { goal, percentage } = await updateGoalProgressUseCase.execute({
    goalId: id,
    amount,
    userId: request.user.sub,
  })

  return reply.status(200).send({
    goal: goalPresenter(goal),
    percentage,
  })
}
