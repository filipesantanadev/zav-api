import { makeCreateTransactionUseCase } from '@/use-cases/factories/transactions/make-create-transaction-use-case'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createTransactionBodySchema = z.object({
    title: z.string(),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    date: z.coerce.date(),
    notes: z.string().nullable().optional().default(null),
    categoryId: z.string().uuid().nullable().optional().default(null),
  })

  const { title, amount, type, date, notes, categoryId } =
    createTransactionBodySchema.parse(request.body)

  const createTransactionUseCase = makeCreateTransactionUseCase()

  const transaction = await createTransactionUseCase.execute({
    userId: request.user.sub,
    title,
    amount,
    type,
    date,
    notes,
    categoryId,
  })

  return reply.status(201).send(transaction)
}
