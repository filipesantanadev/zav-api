import { CategoryHasActiveGoalsError } from '@/use-cases/errors/category-has-active-goals-error'
import { makeDeleteCategoryUseCase } from '@/use-cases/factories/categories/make-delete-category-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCategoryParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const deleteCategoryUseCase = makeDeleteCategoryUseCase()

  const { id } = deleteCategoryParamsSchema.parse(request.params)

  try {
    await deleteCategoryUseCase.execute({
      id,
      userId: request.user.sub,
    })
  } catch (err) {
    if (err instanceof CategoryHasActiveGoalsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(204).send()
}
