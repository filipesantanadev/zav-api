import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { GetLast6MonthsBalanceUseCase } from '@/use-cases/transactions/get-last-6-months-balance'

export function makeGetLast6MonthsBalanceUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new GetLast6MonthsBalanceUseCase(transactionsRepository)

  return useCase
}
