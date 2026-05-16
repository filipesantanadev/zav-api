import { prisma } from '@/lib/prisma'
import type {
  CreateGoalInput,
  FetchGoalsFilters,
  FetchGoalsResponse,
  Goal,
  GoalsRepository,
  GoalStatus,
  UpdateGoalInput,
  UpdateGoalProgressInput,
} from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
  private toGoal(raw: {
    id: string
    title: string
    targetAmount: { toNumber(): number }
    currentAmount: { toNumber(): number }
    deadline: Date
    status: GoalStatus
    userId: string
    categoryId: string | null
    createdAt: Date
    updatedAt: Date
  }): Goal {
    return {
      ...raw,
      targetAmount: raw.targetAmount.toNumber(),
      currentAmount: raw.currentAmount.toNumber(),
    }
  }

  async findById(id: string) {
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return null
    return this.toGoal(goal)
  }

  async findManyByUserId(filters: FetchGoalsFilters) {
    const where = { userId: filters.userId }

    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
      }),
      prisma.goal.count({ where }),
    ])

    return {
      goals: goals.map(this.toGoal.bind(this)),
      total,
    }
  }

  async updateProgress(id: string, data: UpdateGoalProgressInput) {
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: data.currentAmount,
        status: data.status,
      },
    })
    return this.toGoal(goal)
  }

  async updateStatus(id: string, status: GoalStatus) {
    const goal = await prisma.goal.update({
      where: { id },
      data: { status },
    })
    return this.toGoal(goal)
  }

  async update(id: string, data: UpdateGoalInput) {
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.targetAmount !== undefined && {
          targetAmount: data.targetAmount,
        }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        ...('categoryId' in data && { categoryId: data.categoryId ?? null }),
      },
    })
    return this.toGoal(goal)
  }

  async create(data: CreateGoalInput) {
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        userId: data.userId,
        categoryId: data.categoryId ?? null,
      },
    })
    return this.toGoal(goal)
  }

  async delete(id: string) {
    await prisma.goal.delete({ where: { id } })
  }
}
