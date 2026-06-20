import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository'
import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { DeleteCategoryUseCase } from '@/use-cases/categories/delete-category'

export function makeDeleteCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new DeleteCategoryUseCase(categoriesRepository, goalsRepository)

  return useCase
}
