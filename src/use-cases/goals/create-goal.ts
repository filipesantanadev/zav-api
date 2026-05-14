import type { Goal, GoalsRepository } from '@/repositories/goals-repository'
import dayjs from 'dayjs'
import { InvalidCurrentAmountError } from '../errors/invalid-current-amount-error'
import { InvalidGoalDeadlineError } from '../errors/invalid-goal-deadline-error'
import { InvalidTargetAmountError } from '../errors/invalid-target-amount-error'
import { CurrentAmountExceedsTargetError } from '../errors/current-amount-exceeds-target-error'

interface CreateGoalUseCaseRequest {
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  userId: string
  categoryId?: string | null
}

interface CreateGoalUseCaseResponse {
  goal: Goal
}

export class CreateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    title,
    targetAmount,
    currentAmount,
    deadline,
    userId,
    categoryId,
  }: CreateGoalUseCaseRequest): Promise<CreateGoalUseCaseResponse> {
    if (targetAmount <= 0) {
      throw new InvalidTargetAmountError()
    }

    if (currentAmount < 0) {
      throw new InvalidCurrentAmountError()
    }

    if (currentAmount > targetAmount) {
      throw new CurrentAmountExceedsTargetError()
    }

    if (dayjs(deadline).isSame(dayjs()) || dayjs(deadline).isBefore(dayjs())) {
      throw new InvalidGoalDeadlineError()
    }

    const goal = await this.goalsRepository.create({
      title,
      targetAmount,
      currentAmount,
      deadline,
      status: 'IN_PROGRESS',
      userId,
      categoryId: categoryId ?? null,
    })

    return {
      goal,
    }
  }
}
