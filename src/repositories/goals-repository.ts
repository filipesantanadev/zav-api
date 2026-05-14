export type GoalStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELLED'

export interface CreateGoalInput {
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: GoalStatus
  userId: string
  categoryId?: string | null
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: GoalStatus
  userId: string
  categoryId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UpdateGoalProgressInput {
  currentAmount: number
  status: GoalStatus
}

export interface GoalsRepository {
  findById(id: string): Promise<Goal | null>
  updateProgress(id: string, data: UpdateGoalProgressInput): Promise<Goal>
  create(data: CreateGoalInput): Promise<Goal>
}
