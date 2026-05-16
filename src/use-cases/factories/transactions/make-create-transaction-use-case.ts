import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { CreateTransactionUseCase } from '@/use-cases/transactions/create-transaction'

export function makeCreateTransactionUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const createTransactionUseCase = new CreateTransactionUseCase(
    transactionsRepository,
  )

  return createTransactionUseCase
}
