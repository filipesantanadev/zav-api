import { goalPresenter } from '@/http/presenters/goal-presenter'
import { makeUpdateGoalUseCase } from '@/use-cases/factories/goals/make-update-goal-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateGoalParamsSchema = z.object({
    id: z.string().uuid(''),
  })

  const updateGoalBodySchema = z.object({
    title: z.string().optional(),
    targetAmount: z.number().positive().optional(),
    deadline: z.coerce.date().optional(),
    categoryId: z.string().uuid().nullable().optional().default(null),
  })

  const updateGoalUseCase = makeUpdateGoalUseCase()

  const { id } = updateGoalParamsSchema.parse(request.params)

  const { title, targetAmount, deadline, categoryId } =
    updateGoalBodySchema.parse(request.body)

  const { goal } = await updateGoalUseCase.execute({
    goalId: id,
    ...(title && { title }),
    ...(targetAmount && { targetAmount }),
    ...(deadline && { deadline }),
    ...(categoryId && { categoryId }),
    userId: request.user.sub,
  })

  return reply.status(204).send({
    goal: goalPresenter(goal),
  })
}
