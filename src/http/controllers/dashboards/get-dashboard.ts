import { cache } from '@/infra/cache/cache.service'
import { makeListGoalsUseCase } from '@/use-cases/factories/goals/make-list-goals-use-case'
import { makeGetExpensesByCategoryUseCase } from '@/use-cases/factories/transactions/make-get-expenses-by-category-use-case'
import { makeGetLast6MonthsBalanceUseCase } from '@/use-cases/factories/transactions/make-get-last-6-months-balance-use-case'
import { makeGetMonthlySummaryUseCase } from '@/use-cases/factories/transactions/make-get-monthly-summary-use-case'
import dayjs from 'dayjs'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import z from 'zod'

export async function getDashboard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getDashboardQuerySchema = z.object({
    month: z.coerce
      .number()
      .min(1)
      .max(12)
      .default(dayjs().month() + 1),
    year: z.coerce.number().default(dayjs().year()),
  })

  const userId = request.user.sub
  const { month, year } = getDashboardQuerySchema.parse(request.query)

  const cacheKey = `dashboard:${userId}:${month}:${year}`

  try {
    const cached = await cache.get(cacheKey)
    if (cached) {
      return reply.status(200).send(cached)
    }
  } catch (error) {
    console.error('Cache read error:', error)
  }

  const [
    { totalIncome, totalExpense, balance },
    { goals, total: totalGoals },
    { expensesByCategory },
    { last6Months },
  ] = await Promise.all([
    makeGetMonthlySummaryUseCase().execute({ userId, month, year }),
    makeListGoalsUseCase().execute({ userId, page: 1, perPage: 100 }),
    makeGetExpensesByCategoryUseCase().execute({ userId, month, year }),
    makeGetLast6MonthsBalanceUseCase().execute({ userId }),
  ])

  const dashboardData = {
    summary: { totalIncome, totalExpense, balance, month, year },
    goals: { items: goals, total: totalGoals },
    expensesByCategory,
    last6Months,
  }

  try {
    await cache.set(cacheKey, dashboardData, 300)
  } catch (error) {
    console.error('Cache write error:', error)
  }

  return reply.status(200).send(dashboardData)
}
