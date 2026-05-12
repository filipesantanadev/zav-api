import dayjs from 'dayjs'

import type {
  Transaction,
  TransactionsRepository,
} from '@/repositories/transactions-repository'
import { InvalidDateRangeError } from '../errors/invalid-date-range-error'

interface FetchTransactionsUseCaseRequest {
  userId: string
  page?: number
  perPage?: number
  type?: 'INCOME' | 'EXPENSE'
  categoryId?: string
  search?: string
  startDate?: Date
  endDate?: Date
}

interface FetchTransactionsUseCaseResponse {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
}

export class FetchTransactionsUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    userId,
    page = 1,
    perPage = 20,
    type,
    categoryId,
    search,
    startDate,
    endDate,
  }: FetchTransactionsUseCaseRequest): Promise<FetchTransactionsUseCaseResponse> {
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      throw new InvalidDateRangeError()
    }

    const { transactions, total } =
      await this.transactionsRepository.findManyWithFilters({
        userId,
        page,
        perPage,
        type,
        categoryId,
        search,
        startDate,
        endDate,
      })

    return {
      transactions,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }
}
