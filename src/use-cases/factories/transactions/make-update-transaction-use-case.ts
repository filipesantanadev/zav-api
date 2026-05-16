import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { UpdateTransactionUseCase } from '@/use-cases/transactions/update-transaction'

export function makeUpdateTransctionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const updateTransctionUseCase = new UpdateTransactionUseCase(
    transactionsRepository,
  )

  return updateTransctionUseCase
}
