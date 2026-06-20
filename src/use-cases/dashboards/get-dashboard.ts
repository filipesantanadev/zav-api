import dayjs from 'dayjs'
import type { GoalsRepository } from '@/repositories/goals-repository'
import type { TransactionsRepository } from '@/repositories/transactions-repository'
import type { CacheService } from '@/infra/cache/cache.service'

interface GetDashboardUseCaseRequest {
  userId: string
  month: number
  year: number
}

interface GetDashboardUseCaseResponse {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    month: number
    year: number
  }
  goals: {
    items: Awaited<ReturnType<GoalsRepository['findManyByUserId']>>['goals']
    total: number
  }
  expensesByCategory: Awaited<
    ReturnType<TransactionsRepository['getExpensesByCategory']>
  >
  last6Months: {
    month: number
    year: number
    totalIncome: number
    totalExpense: number
    balance: number
  }[]
}

export class GetDashboardUseCase {
  constructor(
    private transactionsRepository: TransactionsRepository,
    private goalsRepository: GoalsRepository,
    private cacheService: CacheService,
  ) {}

  async execute({
    userId,
    month,
    year,
  }: GetDashboardUseCaseRequest): Promise<GetDashboardUseCaseResponse> {
    const cacheKey = `dashboard:${userId}:${month}:${year}`

    try {
      const cached =
        await this.cacheService.get<GetDashboardUseCaseResponse>(cacheKey)
      if (cached) return cached
    } catch {
      // cache read is best-effort; a Redis failure must not block the response
    }

    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate()
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate()

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = dayjs().subtract(i, 'month')
      return { month: date.month() + 1, year: date.year() }
    }).reverse()

    const [
      { totalIncome, totalExpense },
      { goals, total: totalGoals },
      expensesByCategory,
      last6Months,
    ] = await Promise.all([
      this.transactionsRepository.getMonthlySummary(userId, startDate, endDate),
      this.goalsRepository.findManyByUserId({ userId, page: 1, perPage: 100 }),
      this.transactionsRepository.getExpensesByCategory(
        userId,
        startDate,
        endDate,
      ),
      Promise.all(
        months.map(async ({ month: m, year: y }) => {
          const start = dayjs(`${y}-${m}-01`).startOf('month').toDate()
          const end = dayjs(`${y}-${m}-01`).endOf('month').toDate()
          const { totalIncome: inc, totalExpense: exp } =
            await this.transactionsRepository.getMonthlySummary(
              userId,
              start,
              end,
            )
          return {
            month: m,
            year: y,
            totalIncome: inc,
            totalExpense: exp,
            balance: inc - exp,
          }
        }),
      ),
    ])

    const dashboardData: GetDashboardUseCaseResponse = {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        month,
        year,
      },
      goals: { items: goals, total: totalGoals },
      expensesByCategory,
      last6Months,
    }

    try {
      await this.cacheService.set(cacheKey, dashboardData, 300)
    } catch {
      // cache write is best-effort; a Redis failure must not abort the response
    }

    return dashboardData
  }
}
