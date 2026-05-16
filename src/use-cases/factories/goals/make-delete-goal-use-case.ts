import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { DeleteGoalUseCase } from '@/use-cases/goals/delete-goal'

export function makeDeleteGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const deleteGoalUseCase = new DeleteGoalUseCase(goalsRepository)

  return deleteGoalUseCase
}
