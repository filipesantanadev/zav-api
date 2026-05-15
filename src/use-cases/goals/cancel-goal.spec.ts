import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'
import { CancelGoalUseCase } from './cancel-goal'
import dayjs from 'dayjs'

let goalsRepository: InMemoryGoalsRepository
let sut: CancelGoalUseCase

describe('Cancel Goal Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new CancelGoalUseCase(goalsRepository)
  })

  it('should be able to cancel a goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: cancelledGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
    })

    expect(cancelledGoal.status).toEqual('CANCELLED')
    expect(cancelledGoal.currentAmount).toEqual(0)
  })

  it('should not be able to cancel a goal from another user', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to cancel a non-existent goal', async () => {
    await expect(() =>
      sut.execute({
        goalId: 'non-existent-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to cancel an already achieved goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await goalsRepository.updateStatus(goal.id, 'ACHIEVED')

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyAchievedError)
  })

  it('should not be able to cancel an already cancelled goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await goalsRepository.updateStatus(goal.id, 'CANCELLED')

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyCancelledError)
  })
})
