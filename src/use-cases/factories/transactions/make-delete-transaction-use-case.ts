import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { DeleteTransactionUseCase } from '@/use-cases/transactions/delete-transaction'

export function makeDeleteTransactionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const useCase = new DeleteTransactionUseCase(transactionsRepository)

  return useCase
}
