import type {
  CreateGoalInput,
  Goal,
  GoalsRepository,
} from '../goals-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryGoalsRepository implements GoalsRepository {
  public items: Goal[] = []

  async create(data: CreateGoalInput) {
    const goal = {
      id: randomUUID(),
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: new Date(),
      status: data.status,
      userId: data.userId,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(goal)

    return goal
  }
}
