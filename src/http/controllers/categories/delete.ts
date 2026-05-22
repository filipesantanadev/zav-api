import { makeDeleteCategoryUseCase } from '@/use-cases/factories/categories/make-delete-category-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCategoryParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const deleteCategoryUseCase = makeDeleteCategoryUseCase()

  const { id } = deleteCategoryParamsSchema.parse(request.params)

  await deleteCategoryUseCase.execute({
    id,
    userId: request.user.sub,
  })

  return reply.status(204).send()
}
