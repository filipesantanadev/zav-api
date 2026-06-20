import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { UpdateTransactionUseCase } from '@/use-cases/transactions/update-transaction'
import { cache } from '@/infra/cache/cache.service'

export function makeUpdateTransctionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new UpdateTransactionUseCase(transactionsRepository, cache)

  return useCase
}
