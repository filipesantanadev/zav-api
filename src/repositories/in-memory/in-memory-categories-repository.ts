import type { Category, Prisma } from '@prisma/client'
import type { CategoriesRepository } from '../categories-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

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
}
