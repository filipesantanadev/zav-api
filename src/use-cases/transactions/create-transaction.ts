import dayjs from 'dayjs'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'
import type {
  Transaction,
  TransactionsRepository,
} from '@/repositories/transactions-repository'
import type { CacheService } from '@/infra/cache/cache.service'

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
  constructor(
    private transactionsRepository: TransactionsRepository,
    private cacheService: CacheService,
  ) {}

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

    try {
      await this.cacheService.deleteByPattern(`dashboard:${userId}:*`)
    } catch {
      // cache invalidation is best-effort; a Redis failure must not abort a successful write
    }

    return {
      transaction,
    }
  }
}
