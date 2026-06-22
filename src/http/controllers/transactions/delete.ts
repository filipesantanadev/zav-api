import { makeDeleteTransactionUseCase } from '@/use-cases/factories/transactions/make-delete-transaction-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteTransactionParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const deleteTransactionUseCase = makeDeleteTransactionUseCase()

  const { id } = deleteTransactionParamsSchema.parse(request.params)

  try {
    await deleteTransactionUseCase.execute({
      id,
      userId: request.user.sub,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }

  return reply.status(204).send()
}
