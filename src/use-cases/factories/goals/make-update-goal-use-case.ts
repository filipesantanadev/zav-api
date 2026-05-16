import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { UpdateGoalUseCase } from '@/use-cases/goals/update-goal'

export function makeUpdateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const updateGoalUseCase = new UpdateGoalUseCase(goalsRepository)

  return updateGoalUseCase
}
