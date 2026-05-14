import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import type { CategoriesRepository } from '@/repositories/categories-repository'

interface DeleteCategoryUseCaseRequest {
  id: string
  userId: string
}

export class DeleteCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ id, userId }: DeleteCategoryUseCaseRequest): Promise<void> {
    const category = await this.categoriesRepository.findById(id)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    if (category.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    await this.categoriesRepository.delete(id)
  }
}
