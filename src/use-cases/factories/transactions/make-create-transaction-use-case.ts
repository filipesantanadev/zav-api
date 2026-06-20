import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { CreateTransactionUseCase } from '@/use-cases/transactions/create-transaction'
import { cache } from '@/infra/cache/cache.service'

export function makeCreateTransactionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new CreateTransactionUseCase(transactionsRepository, cache)

  return useCase
}
