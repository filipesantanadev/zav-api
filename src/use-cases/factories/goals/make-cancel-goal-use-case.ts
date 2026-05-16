import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { CancelGoalUseCase } from '@/use-cases/goals/cancel-goal'

export function makeCancelGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const cancelGoalUseCase = new CancelGoalUseCase(goalsRepository)

  return cancelGoalUseCase
}
