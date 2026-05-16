import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { CancelGoalUseCase } from '@/use-cases/goals/cancel-goal'

export function makeCancelGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new CancelGoalUseCase(goalsRepository)

  return useCase
}
