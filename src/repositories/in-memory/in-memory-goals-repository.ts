import type {
  CreateGoalInput,
  FetchGoalsFilters,
  Goal,
  GoalsRepository,
  UpdateGoalProgressInput,
} from '../goals-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryGoalsRepository implements GoalsRepository {
  public items: Goal[] = []

  async findById(id: string) {
    const goal = this.items.find((item) => item.id === id)

    if (!goal) {
      return null
    }

    return goal
  }

  async findManyByUserId(filters: FetchGoalsFilters) {
    const goals = this.items.filter((item) => item.userId === filters.userId)

    const paginated = goals.slice(
      (filters.page - 1) * filters.perPage,
      filters.page * filters.perPage,
    )

    const total = goals.length

    return {
      goals: paginated,
      total,
    }
  }

  async updateProgress(id: string, data: UpdateGoalProgressInput) {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]!

    const updated: Goal = {
      ...current,
      currentAmount: data.currentAmount,
      status: data.status,
      updatedAt: new Date(),
    }

    this.items[index] = updated
    return updated
  }

  async create(data: CreateGoalInput) {
    const goal = {
      id: randomUUID(),
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: new Date(data.deadline),
      status: data.status,
      userId: data.userId,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(goal)

    return goal
  }

  async delete(id: string) {
    const index = this.items.findIndex((item) => item.id === id)
    this.items.splice(index, 1)
  }
}
