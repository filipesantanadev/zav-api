import type { Prisma } from '@prisma/client'
import type {
  CategoriesRepository,
  FetchCategoriesFilters,
} from '../categories-repository'
import { prisma } from '@/lib/prisma'

export class PrismaCategoriesRepository implements CategoriesRepository {
  async findById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return null
    return category
  }

  async findManyByUserId(filters: FetchCategoriesFilters) {
    const where = { userId: filters.userId }

    const [categories, total] = await Promise.all([
      await prisma.category.findMany({
        where,
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
      }),
      prisma.category.count({ where }),
    ])

    return {
      categories,
      total,
    }
  }

  async findNameByUserId(name: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: { name, userId },
    })
    return category
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        userId: data.userId,
      },
    })
    return category
  }

  async delete(id: string) {
    await prisma.category.delete({ where: { id } })
  }
}
