import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { CategoryHasActiveGoalsError } from '../errors/category-has-active-goals-error'
import type { CategoriesRepository } from '@/repositories/categories-repository'
import type { GoalsRepository } from '@/repositories/goals-repository'

interface DeleteCategoryUseCaseRequest {
  id: string
  userId: string
}

export class DeleteCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute({ id, userId }: DeleteCategoryUseCaseRequest): Promise<void> {
    const category = await this.categoriesRepository.findById(id)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    if (category.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    const hasActiveGoals =
      await this.goalsRepository.hasActiveGoalsByCategory(id)

    if (hasActiveGoals) {
      throw new CategoryHasActiveGoalsError()
    }

    await this.categoriesRepository.delete(id)
  }
}
