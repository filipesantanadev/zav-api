import { goalPresenter } from '@/http/presenters/goal-presenter'
import { makeListGoalsUseCase } from '@/use-cases/factories/goals/make-list-goals-use-case'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listGoalsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(100).default(20),
  })

  const { page, perPage } = listGoalsQuerySchema.parse(request.query)

  const listGoalsUseCase = makeListGoalsUseCase()

  const { goals, total, totalPages } = await listGoalsUseCase.execute({
    userId: request.user.sub,
    page,
    perPage,
  })

  return reply.status(200).send({
    goals: goals.map(goalPresenter),
    total,
    page,
    perPage,
    totalPages,
  })
}
