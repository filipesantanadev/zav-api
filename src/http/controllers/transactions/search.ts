import { makeFetchTransactionsUseCase } from '@/use-cases/factories/transactions/make-fetch-transactions-use-case'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchTransactionsQuerySchema = z.object({
    search: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(100).default(20),
  })

  const { page, perPage, type, categoryId, search, startDate, endDate } =
    searchTransactionsQuerySchema.parse(request.query)

  const searchTransactionsUseCase = makeFetchTransactionsUseCase()

  const { transactions, total, totalPages } =
    await searchTransactionsUseCase.execute({
      userId: request.user.sub,
      page,
      perPage,
      ...(type && { type }),
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })

  return reply
    .status(200)
    .send({ transactions, total, page, perPage, totalPages })
}
