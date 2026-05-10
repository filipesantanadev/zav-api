import type {
  Transaction,
  TransactionsRepository,
} from '@/repositories/transactions-repository'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import dayjs from 'dayjs'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'

interface CreateTransactionUseCaseRequest {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
  notes?: string | null
  userId: string
  categoryId?: string | null
}

interface CreateTransactionUseCaseResponse {
  transaction: Transaction
}

export class CreateTransactionUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    title,
    amount,
    type,
    date,
    notes,
    userId,
    categoryId,
  }: CreateTransactionUseCaseRequest): Promise<CreateTransactionUseCaseResponse> {
    if (amount <= 0) {
      throw new InvalidTransactionAmountError()
    }

    if (dayjs(date).isAfter(dayjs(), 'day')) {
      throw new FutureDateTransactionError()
    }

    const transaction = await this.transactionsRepository.create({
      title,
      amount,
      type,
      date,
      notes: notes ?? null,
      userId,
      categoryId: categoryId ?? null,
    })

    return {
      transaction,
    }
  }
}
