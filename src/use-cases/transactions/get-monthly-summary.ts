import type { TransactionsRepository } from '@/repositories/transactions-repository'
import dayjs from 'dayjs'

interface GetMonthlySummaryUseCaseRequest {
  userId: string
  month?: number
  year?: number
}

interface GetMonthlySummaryUseCaseResponse {
  totalIncome: number
  totalExpense: number
  balance: number
  month: number
  year: number
}

export class GetMonthlySummaryUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    userId,
    month = dayjs().month() + 1,
    year = dayjs().year(),
  }: GetMonthlySummaryUseCaseRequest): Promise<GetMonthlySummaryUseCaseResponse> {
    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate()
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate()

    const { totalIncome, totalExpense } =
      await this.transactionsRepository.getMonthlySummary(
        userId,
        startDate,
        endDate,
      )

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      month,
      year,
    }
  }
}
