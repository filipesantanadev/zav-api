import { makeUpdateTransctionUseCase } from '@/use-cases/factories/transactions/make-update-transaction-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateTransactionParamsSchema = z.object({
    id: z.string().uuid(''),
  })

  const updateTransactionBodySchema = z.object({
    title: z.string().optional(),
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().nullable().optional().default(null),
    categoryId: z.string().uuid().nullable().optional().default(null),
  })

  const updateTransactionUseCase = makeUpdateTransctionUseCase()

  const { id } = updateTransactionParamsSchema.parse(request.params)

  const { title, amount, type, date, notes, categoryId } =
    updateTransactionBodySchema.parse(request.body)

  try {
    const transaction = await updateTransactionUseCase.execute({
      id,
      ...(title && { title }),
      ...(amount && { amount }),
      ...(type && { type }),
      ...(date && { date }),
      ...(notes && { notes }),
      ...(categoryId && { categoryId }),
      userId: request.user.sub,
    })

    return reply.status(204).send(transaction)
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
