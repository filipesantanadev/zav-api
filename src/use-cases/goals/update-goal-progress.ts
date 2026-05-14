import type { Goal, GoalsRepository } from '@/repositories/goals-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GoalAmountExceedsTargetError } from '../errors/goal-amount-exceeds-target-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'
import dayjs from 'dayjs'
import { GoalDeadlineExpiredError } from '../errors/goal-deadline-expired-error'

interface UpdateGoalProgressUseCaseRequest {
  goalId: string
  userId: string
  amount: number
}

interface UpdateGoalProgressUseCaseResponse {
  goal: Goal
  percentage: number
}

export class UpdateGoalProgressUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    goalId,
    userId,
    amount,
  }: UpdateGoalProgressUseCaseRequest): Promise<UpdateGoalProgressUseCaseResponse> {
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

    if (dayjs().isAfter(dayjs(goal.deadline), 'day')) {
      throw new GoalDeadlineExpiredError()
    }

    const newCurrentAmount = goal.currentAmount + amount

    if (newCurrentAmount > goal.targetAmount) {
      throw new GoalAmountExceedsTargetError()
    }

    const isAchieved = newCurrentAmount === goal.targetAmount

    const updatedGoal = await this.goalsRepository.updateProgress(goalId, {
      currentAmount: newCurrentAmount,
      status: isAchieved ? 'ACHIEVED' : 'IN_PROGRESS',
    })

    const percentage = Math.round(
      (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100,
    )

    return {
      goal: updatedGoal,
      percentage,
    }
  }
}
