export interface CreateGoalInput {
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELLED'
  userId: string
  categoryId?: string | null
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELLED'
  userId: string
  categoryId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GoalsRepository {
  create(data: CreateGoalInput): Promise<Goal>
}
