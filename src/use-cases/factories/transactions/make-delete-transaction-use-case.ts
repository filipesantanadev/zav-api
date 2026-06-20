import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { DeleteTransactionUseCase } from '@/use-cases/transactions/delete-transaction'
import { cache } from '@/infra/cache/cache.service'

export function makeDeleteTransactionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new DeleteTransactionUseCase(transactionsRepository, cache)

  return useCase
}
