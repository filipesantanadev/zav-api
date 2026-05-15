import type { GoalsRepository } from '@/repositories/goals-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteGoalUseCaseRequest {
  id: string
  userId: string
}

export class DeleteGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ id, userId }: DeleteGoalUseCaseRequest): Promise<void> {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new ResourceNotFoundError()
    }

    if (goal.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    await this.goalsRepository.delete(id)
  }
}
