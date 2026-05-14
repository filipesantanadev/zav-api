import type { Goal, GoalsRepository } from '@/repositories/goals-repository'

interface ListGoalsUseCaseRequest {
  userId: string
  page?: number
  perPage?: number
}

interface ListGoalsUseCaseResponse {
  goals: Goal[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export class ListGoalsUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    userId,
    page = 1,
    perPage = 20,
  }: ListGoalsUseCaseRequest): Promise<ListGoalsUseCaseResponse> {
    const { goals, total } = await this.goalsRepository.findManyByUserId({
      userId,
      page,
      perPage,
    })

    return {
      goals,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }
}
