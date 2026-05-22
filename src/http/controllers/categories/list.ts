import { makeListCategoriesUseCase } from '@/use-cases/factories/categories/make-list-categories-use-case'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listCategoriesQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(100).default(20),
  })

  const { page, perPage } = listCategoriesQuerySchema.parse(request.query)

  const listCategoriesUseCase = makeListCategoriesUseCase()

  const { categories, total, totalPages } = await listCategoriesUseCase.execute(
    {
      userId: request.user.sub,
      page,
      perPage,
    },
  )

  return reply
    .status(200)
    .send({ categories, total, page, perPage, totalPages })
}
