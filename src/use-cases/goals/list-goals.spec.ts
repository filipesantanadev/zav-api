import { expect, describe, it, beforeEach } from 'vitest'
import { ListGoalsUseCase } from './list-goals'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import dayjs from 'dayjs'

let goalsRepository: InMemoryGoalsRepository
let sut: ListGoalsUseCase

describe('List Goals Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new ListGoalsUseCase(goalsRepository)
  })

  it('should be able to fetch a goals', async () => {
    for (let i = 0; i <= 20; i++) {
      await goalsRepository.create({
        title: 'Buy a Car',
        targetAmount: 100000,
        currentAmount: 0,
        status: 'IN_PROGRESS',
        deadline: dayjs().add(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      })
    }

    await goalsRepository.create({
      title: 'Traveling to Spain',
      targetAmount: 20000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'month').toDate(),
      userId: 'user-2',
      categoryId: 'category-1',
    })

    const { goals, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
    })

    expect(total).toEqual(21)
    expect(goals).toHaveLength(20)
  })

  it('should not be able to fetch a goals created by another user', async () => {
    for (let i = 0; i <= 20; i++) {
      await goalsRepository.create({
        title: 'Buy a Car',
        targetAmount: 100000,
        currentAmount: 0,
        status: 'IN_PROGRESS',
        deadline: dayjs().add(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      })
    }

    const { goals, total } = await sut.execute({
      userId: 'user-2',
      page: 1,
    })

    expect(total).toEqual(0)
    expect(goals).toHaveLength(0)
  })
})
