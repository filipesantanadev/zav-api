import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import dayjs from 'dayjs'
import type { Goal, GoalsRepository } from '@/repositories/goals-repository'
import { InvalidGoalDeadlineError } from '../errors/invalid-goal-deadline-error'
import { GoalTargetAmountBelowCurrentError } from '../errors/goal-target-amount-below-current-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'

interface UpdateGoalUseCaseRequest {
  goalId: string
  userId: string
  title?: string
  targetAmount?: number
  deadline?: Date
  categoryId?: string | null
}

interface UpdateGoalUseCaseResponse {
  goal: Goal
}

export class UpdateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    goalId,
    userId,
    title,
    targetAmount,
    deadline,
    categoryId,
  }: UpdateGoalUseCaseRequest): Promise<UpdateGoalUseCaseResponse> {
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

    if (deadline !== undefined && !dayjs(deadline).isAfter(dayjs())) {
      throw new InvalidGoalDeadlineError()
    }

    if (targetAmount !== undefined && targetAmount < goal.currentAmount) {
      throw new GoalTargetAmountBelowCurrentError()
    }

    const updatedGoal = await this.goalsRepository.update(goalId, {
      ...(title !== undefined && { title }),
      ...(targetAmount !== undefined && { targetAmount }),
      ...(deadline !== undefined && { deadline }),
      ...(categoryId !== undefined && { categoryId }),
    })

    return {
      goal: updatedGoal,
    }
  }
}
