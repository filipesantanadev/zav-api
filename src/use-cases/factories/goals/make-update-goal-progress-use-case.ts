import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { UpdateGoalProgressUseCase } from '@/use-cases/goals/update-goal-progress'

export function makeUpdateGoalProgressUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new UpdateGoalProgressUseCase(goalsRepository)

  return useCase
}
