import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository'
import { ListCategoriesUseCase } from '@/use-cases/categories/list-categories'

export function makeListCategoriesUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const useCase = new ListCategoriesUseCase(categoriesRepository)

  return useCase
}
