import type { Category } from '@prisma/client'
import type { CategoriesRepository } from '@/repositories/categories-repository'

interface ListCategoriesUseCaseRequest {
  userId: string
  page?: number
  perPage?: number
}

interface ListCategoriesUseCaseResponse {
  categories: Category[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export class ListCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    userId,
    page = 1,
    perPage = 20,
  }: ListCategoriesUseCaseRequest): Promise<ListCategoriesUseCaseResponse> {
    const { categories, total } =
      await this.categoriesRepository.findManyByUserId({
        userId,
        page,
        perPage,
      })

    return {
      categories,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }
}
