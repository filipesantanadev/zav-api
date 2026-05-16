import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { FetchTransactionsUseCase } from '@/use-cases/transactions/fetch-transactions'

export function makeFetchTransactionsUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const fetchTransactionsUseCase = new FetchTransactionsUseCase(
    transactionsRepository,
  )

  return fetchTransactionsUseCase
}
