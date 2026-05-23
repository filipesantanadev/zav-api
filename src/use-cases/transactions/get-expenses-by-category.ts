import dayjs from 'dayjs'
import type { TransactionsRepository } from '@/repositories/transactions-repository'

interface GetExpensesByCategoryUseCaseRequest {
  userId: string
  month: number
  year: number
}

interface ExpenseByCategory {
  categoryId: string | null
  categoryName: string | null
  total: number
  percentage: number
}

interface GetExpensesByCategoryUseCaseResponse {
  expensesByCategory: ExpenseByCategory[]
}

export class GetExpensesByCategoryUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    userId,
    month,
    year,
  }: GetExpensesByCategoryUseCaseRequest): Promise<GetExpensesByCategoryUseCaseResponse> {
    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate()
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate()

    const expensesByCategory =
      await this.transactionsRepository.getExpensesByCategory(
        userId,
        startDate,
        endDate,
      )

    return { expensesByCategory }
  }
}
