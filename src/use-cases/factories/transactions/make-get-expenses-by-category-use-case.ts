import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { GetExpensesByCategoryUseCase } from '@/use-cases/transactions/get-expenses-by-category'

export function makeGetExpensesByCategoryUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new GetExpensesByCategoryUseCase(transactionsRepository)

  return useCase
}
