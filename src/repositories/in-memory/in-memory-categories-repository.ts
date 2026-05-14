import type { Category, Prisma } from '@prisma/client'
import type {
  CategoriesRepository,
  FetchCategoriesFilters,
} from '../categories-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findById(id: string) {
    const category = this.items.find((item) => item.id === id)

    if (!category) {
      return null
    }

    return category
  }

  async findManyByUserId(filters: FetchCategoriesFilters) {
    const categories = this.items.filter(
      (item) => item.userId === filters.userId,
    )

    const paginated = categories.slice(
      (filters.page - 1) * filters.perPage,
      filters.page * filters.perPage,
    )

    const total = categories.length

    return {
      categories: paginated,
      total,
    }
  }

  async findNameByUserId(name: string, userId: string) {
    const category = this.items.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.userId === userId,
    )

    if (!category) {
      return null
    }

    return category
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    const category = {
      id: randomUUID(),
      name: data.name,
      color: data.color,
      icon: data.icon,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(category)

    return category
  }

  async delete(id: string) {
    const index = this.items.findIndex((item) => item.id === id)
    this.items.splice(index, 1)
  }
}
