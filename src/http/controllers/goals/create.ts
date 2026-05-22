import { goalPresenter } from '@/http/presenters/goal-presenter'
import { makeCreateGoalUseCase } from '@/use-cases/factories/goals/make-create-goal-use-case'
import dayjs from 'dayjs'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createGoalBodySchema = z.object({
    title: z.string(),
    targetAmount: z.number().positive(),
    currentAmount: z.coerce.number().default(0),
    deadline: z.coerce.date(),
    categoryId: z.string().uuid().nullable().optional().default(null),
  })

  const { title, targetAmount, currentAmount, deadline, categoryId } =
    createGoalBodySchema.parse(request.body)

  const createGoalUseCase = makeCreateGoalUseCase()

  const { goal } = await createGoalUseCase.execute({
    userId: request.user.sub,
    title,
    targetAmount,
    currentAmount,
    deadline,
    categoryId,
  })

  return reply.status(201).send({
    goal: goalPresenter(goal),
  })
}
