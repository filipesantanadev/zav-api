import { expect, describe, it, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { DeleteGoalUseCase } from './delete-goal'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import dayjs from 'dayjs'

let goalsRepository: InMemoryGoalsRepository
let sut: DeleteGoalUseCase

describe('Delete Goal Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new DeleteGoalUseCase(goalsRepository)
  })

  it('should be able to delete a goal', async () => {
    const category = await goalsRepository.create({
      title: 'Buy a Car',
      targetAmount: 100000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'month').toDate(),
      status: 'IN_PROGRESS',
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await sut.execute({
      id: category.id,
      userId: 'user-1',
    })

    const checkedGoal = await goalsRepository.findById(category.id)
    expect(checkedGoal).toBeNull()
  })

  it('should not be able to delete a goal when created by other user', async () => {
    const category = await goalsRepository.create({
      title: 'Buy a Car',
      targetAmount: 100000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'month').toDate(),
      status: 'IN_PROGRESS',
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a non-existent goal', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
