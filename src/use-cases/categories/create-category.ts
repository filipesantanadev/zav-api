import type { CategoriesRepository } from '@/repositories/categories-repository'
import type { Category } from '@prisma/client'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface CreateCategoryUseCaseRequest {
  name: string
  color: string
  icon: string
  userId: string
}

interface CreateCategoryUseCaseResponse {
  category: Category
}

export class CreateCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    name,
    color,
    icon,
    userId,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    const doesCategoryNameAlreadyBeenUsedByUser =
      await this.categoriesRepository.findNameByUserId(name, userId)

    if (doesCategoryNameAlreadyBeenUsedByUser) {
      throw new ResourceNotFoundError()
    }

    const category = await this.categoriesRepository.create({
      name,
      color,
      icon,
      userId,
    })

    return {
      category,
    }
  }
}
