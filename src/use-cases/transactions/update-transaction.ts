import type {
  Transaction,
  TransactionsRepository,
} from '@/repositories/transactions-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'
import dayjs from 'dayjs'

interface UpdateTransactionUseCaseRequest {
  transactionId: string
  userId: string
  title?: string
  amount?: number
  type?: 'INCOME' | 'EXPENSE'
  date?: Date
  notes?: string | null
  categoryId?: string | null
}

interface UpdateTransactionUseCaseResponse {
  transaction: Transaction
}

export class UpdateTransactionUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    transactionId,
    userId,
    title,
    amount,
    type,
    date,
    notes,
    categoryId,
  }: UpdateTransactionUseCaseRequest): Promise<UpdateTransactionUseCaseResponse> {
    const transaction =
      await this.transactionsRepository.findById(transactionId)

    if (!transaction) {
      throw new ResourceNotFoundError()
    }

    if (transaction.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    if (amount !== undefined && amount <= 0) {
      throw new InvalidTransactionAmountError()
    }

    if (date !== undefined && dayjs(date).isAfter(dayjs(), 'day')) {
      throw new FutureDateTransactionError()
    }

    const updatedTransaction = await this.transactionsRepository.update(
      transactionId,
      {
        ...(title !== undefined && { title }),
        ...(amount !== undefined && { amount }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date }),
        ...(notes !== undefined && { notes }),
        ...(categoryId !== undefined && { categoryId }),
      },
    )

    return {
      transaction: updatedTransaction,
    }
  }
}
