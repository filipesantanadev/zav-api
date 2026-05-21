import { makeDeleteTransactionUseCase } from '@/use-cases/factories/transactions/make-delete-transaction-use-case'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteTransactionParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const deleteTransactionUseCase = makeDeleteTransactionUseCase()

  const { id } = deleteTransactionParamsSchema.parse(request.params)

  await deleteTransactionUseCase.execute({
    id,
    userId: request.user.sub,
  })

  return reply.status(204).send()
}
