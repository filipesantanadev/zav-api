import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository'
import { DeleteCategoryUseCase } from '@/use-cases/categories/delete-category'

export function makeDeleteCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const useCase = new DeleteCategoryUseCase(categoriesRepository)

  return useCase
}
