import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { CreateGoalUseCase } from '@/use-cases/goals/create-goal'

export function makeCreateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const createGoalUseCase = new CreateGoalUseCase(goalsRepository)

  return createGoalUseCase
}
