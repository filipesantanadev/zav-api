import type { Goal, GoalsRepository } from '@/repositories/goals-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'

interface CancelGoalUseCaseRequest {
  goalId: string
  userId: string
}

interface CancelGoalUseCaseResponse {
  goal: Goal
}

export class CancelGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    goalId,
    userId,
  }: CancelGoalUseCaseRequest): Promise<CancelGoalUseCaseResponse> {
    const goal = await this.goalsRepository.findById(goalId)

    if (!goal) {
      throw new ResourceNotFoundError()
    }

    if (goal.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    if (goal.status === 'ACHIEVED') {
      throw new GoalAlreadyAchievedError()
    }

    if (goal.status === 'CANCELLED') {
      throw new GoalAlreadyCancelledError()
    }

    const updatedStatus = await this.goalsRepository.updateStatus(
      goalId,
      'CANCELLED',
    )

    return {
      goal: updatedStatus,
    }
  }
}
