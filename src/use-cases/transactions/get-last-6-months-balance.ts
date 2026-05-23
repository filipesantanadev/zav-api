import dayjs from 'dayjs'
import type { TransactionsRepository } from '@/repositories/transactions-repository'

interface GetLast6MonthsBalanceUseCaseRequest {
  userId: string
}

interface MonthBalance {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
}

interface GetLast6MonthsBalanceUseCaseResponse {
  last6Months: MonthBalance[]
}

export class GetLast6MonthsBalanceUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    userId,
  }: GetLast6MonthsBalanceUseCaseRequest): Promise<GetLast6MonthsBalanceUseCaseResponse> {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = dayjs().subtract(i, 'month')
      return { month: date.month() + 1, year: date.year() }
    }).reverse()

    const last6Months = await Promise.all(
      months.map(async ({ month, year }) => {
        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate()
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate()

        const { totalIncome, totalExpense } =
          await this.transactionsRepository.getMonthlySummary(
            userId,
            startDate,
            endDate,
          )

        return {
          month,
          year,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        }
      }),
    )

    return { last6Months }
  }
}
