import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { ListGoalsUseCase } from '@/use-cases/goals/list-goals'

export function makeListGoalsUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new ListGoalsUseCase(goalsRepository)

  return useCase
}
