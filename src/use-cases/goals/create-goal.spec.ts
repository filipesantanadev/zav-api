import { expect, describe, it, beforeEach } from 'vitest'
import dayjs from 'dayjs'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import { CreateGoalUseCase } from './create-goal'
import { InvalidTargetAmountError } from '../errors/invalid-target-amount-error'
import { InvalidCurrentAmountError } from '../errors/invalid-current-amount-error'
import { CurrentAmountExceedsTargetError } from '../errors/current-amount-exceeds-target-error'
import { InvalidGoalDeadlineError } from '../errors/invalid-goal-deadline-error'

let goalsRepository: InMemoryGoalsRepository
let sut: CreateGoalUseCase

describe('Create a Goals Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new CreateGoalUseCase(goalsRepository)
  })

  it('should be able to create a goal', async () => {
    const { goal } = await sut.execute({
      title: 'Buy a Car',
      targetAmount: 100000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    expect(goal.id).toEqual(expect.any(String))
  })

  it('should be able to create a goal without category', async () => {
    const { goal } = await sut.execute({
      title: 'Buy a Car',
      targetAmount: 100000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'month').toDate(),
      userId: 'user-1',
    })

    expect(goal.id).toEqual(expect.any(String))
  })

  it('should not be able to create a goal when target amount not greater then zero', async () => {
    await expect(() =>
      sut.execute({
        title: 'Buy a Car',
        targetAmount: 0,
        currentAmount: 0,
        deadline: dayjs().add(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(InvalidTargetAmountError)
  })

  it('should not be able to create a goal when current amount is negative', async () => {
    await expect(() =>
      sut.execute({
        title: 'Buy a Car',
        targetAmount: 1110,
        currentAmount: -150,
        deadline: dayjs().add(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentAmountError)
  })

  it('should not be able to create a goal when current amount is greter then target amount', async () => {
    await expect(() =>
      sut.execute({
        title: 'Buy a Car',
        targetAmount: 100,
        currentAmount: 5000,
        deadline: dayjs().add(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(CurrentAmountExceedsTargetError)
  })

  it('should not be able to create a goal deadline is before the created goal', async () => {
    await expect(() =>
      sut.execute({
        title: 'Buy a Car',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: dayjs().subtract(1, 'month').toDate(),
        userId: 'user-1',
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(InvalidGoalDeadlineError)
  })
})
