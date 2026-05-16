import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository'
import { DeleteCategoryUseCase } from '@/use-cases/categories/delete-category'

export function makeDeleteCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const deleteCategoryUseCase = new DeleteCategoryUseCase(categoriesRepository)

  return deleteCategoryUseCase
}
