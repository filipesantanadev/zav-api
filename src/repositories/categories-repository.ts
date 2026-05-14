import type { Category, Prisma } from '@prisma/client'

export interface FetchCategoriesFilters {
  userId: string
  page: number
  perPage: number
}

export interface FetchCategoriesResponse {
  categories: Category[]
  total: number
}
export interface CategoriesRepository {
  findManyByUserId(
    filters: FetchCategoriesFilters,
  ): Promise<FetchCategoriesResponse>
  findNameByUserId(name: string, userId: string): Promise<Category | null>
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
}
