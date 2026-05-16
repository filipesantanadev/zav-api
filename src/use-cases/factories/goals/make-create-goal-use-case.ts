import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { CreateGoalUseCase } from '@/use-cases/goals/create-goal'

export function makeCreateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new CreateGoalUseCase(goalsRepository)

  return useCase
}
