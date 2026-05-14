import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import { UpdateGoalProgressUseCase } from './update-goal-progress'
import dayjs from 'dayjs'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'
import { GoalAmountExceedsTargetError } from '../errors/goal-amount-exceeds-target-error'
import { GoalDeadlineExpiredError } from '../errors/goal-deadline-expired-error'

let goalsRepository: InMemoryGoalsRepository
let sut: UpdateGoalProgressUseCase

describe('Update Goal Progress Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new UpdateGoalProgressUseCase(goalsRepository)
  })

  it('should be able to update goal progress', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      amount: 5000,
    })

    expect(updatedGoal.currentAmount).toEqual(5000)
    expect(updatedGoal.status).toEqual('IN_PROGRESS')
  })

  it('should be able to update multiply goal progress', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal1 } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      amount: 5000,
    })

    expect(updatedGoal1.currentAmount).toEqual(5000)
    expect(updatedGoal1.status).toEqual('IN_PROGRESS')

    const { goal: updatedGoal2, percentage } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      amount: 5000,
    })

    expect(updatedGoal2.currentAmount).toEqual(10000)
    expect(percentage).toEqual(100)
    expect(updatedGoal2.status).toEqual('ACHIEVED')
  })

  it('should mark goal as ACHIEVED when target is reached', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      amount: 10000,
    })

    expect(updatedGoal.currentAmount).toEqual(10000)
    expect(updatedGoal.status).toEqual('ACHIEVED')
  })

  it('should not be able to update progress of a non-existent goal', async () => {
    await expect(() =>
      sut.execute({
        goalId: 'non-existent-id',
        userId: 'user-1',
        amount: 5000,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update progress of a goal from another user', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-2',
        amount: 5000,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update progress of an achieved goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await goalsRepository.updateProgress(goal.id, {
      currentAmount: 10000,
      status: 'ACHIEVED',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyAchievedError)
  })

  it('should not be able to update progress of a cancelled goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await goalsRepository.updateProgress(goal.id, {
      currentAmount: 0,
      status: 'CANCELLED',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyCancelledError)
  })

  it('should not be able to update progress when deadline expired', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().subtract(1, 'week').toDate(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
        amount: 15000,
      }),
    ).rejects.toBeInstanceOf(GoalDeadlineExpiredError)
  })

  it('should not be able to exceed the target amount', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
        amount: 15000,
      }),
    ).rejects.toBeInstanceOf(GoalAmountExceedsTargetError)
  })
})
