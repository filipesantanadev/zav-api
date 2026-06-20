import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transactions-repository'
import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { cache } from '@/infra/cache/cache.service'
import { GetDashboardUseCase } from '@/use-cases/dashboards/get-dashboard'

export function makeGetDashboardUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const goalsRepository = new PrismaGoalsRepository()
  return new GetDashboardUseCase(transactionsRepository, goalsRepository, cache)
}
