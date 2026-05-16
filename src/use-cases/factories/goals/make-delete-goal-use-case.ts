import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { DeleteGoalUseCase } from '@/use-cases/goals/delete-goal'

export function makeDeleteGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new DeleteGoalUseCase(goalsRepository)

  return useCase
}
