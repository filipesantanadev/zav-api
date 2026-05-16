import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { GetMonthlySummaryUseCase } from '@/use-cases/transactions/get-monthly-summary'

export function makeGetMonthlySummaryUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new GetMonthlySummaryUseCase(transactionsRepository)

  return useCase
}
