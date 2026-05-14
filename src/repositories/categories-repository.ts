import type { Category, Prisma } from '@prisma/client'

export interface CategoriesRepository {
  findNameByUserId(name: string, userId: string): Promise<Category | null>
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
}
