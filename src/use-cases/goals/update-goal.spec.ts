import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import { UpdateGoalUseCase } from './update-goal'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GoalAlreadyAchievedError } from '../errors/goal-already-achieved-error'
import { GoalAlreadyCancelledError } from '../errors/goal-already-cancelled-error'
import { GoalTargetAmountBelowCurrentError } from '../errors/goal-target-amount-below-current-error'
import dayjs from 'dayjs'
import { InvalidGoalDeadlineError } from '../errors/invalid-goal-deadline-error'
import { any } from 'zod'

let goalsRepository: InMemoryGoalsRepository
let sut: UpdateGoalUseCase

describe('Update Goal Use Case', () => {
  beforeEach(() => {
    goalsRepository = new InMemoryGoalsRepository()
    sut = new UpdateGoalUseCase(goalsRepository)
  })

  it('should be able to update a goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      title: 'New Emergency fund',
      targetAmount: 20000,
    })

    expect(updatedGoal.title).toEqual('New Emergency fund')
    expect(updatedGoal.targetAmount).toEqual(20000)
  })

  it('should be able to link a category to a goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      categoryId: 'category-1',
    })

    expect(updatedGoal.categoryId).toEqual('category-1')
  })

  it('should be able to unlink a category from a goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      categoryId: null,
    })

    expect(updatedGoal.categoryId).toBeNull()
  })

  it('should be able to update a deadline to future date', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'day').toDate(),
      userId: 'user-1',
    })

    expect(dayjs(goal.deadline).isSame(dayjs().add(1, 'day'), 'day')).toBe(true)

    const newDeadline = dayjs().add(1, 'month').toDate()

    const { goal: updatedGoal } = await sut.execute({
      goalId: goal.id,
      userId: 'user-1',
      deadline: newDeadline,
    })

    expect(
      dayjs(updatedGoal.deadline).isSame(dayjs().add(1, 'month'), 'day'),
    ).toBe(true)

    expect(
      dayjs(updatedGoal.deadline).isAfter(dayjs(goal.deadline), 'day'),
    ).toBe(true)
  })

  it('should not be able to update a non-existent goal', async () => {
    await expect(() =>
      sut.execute({
        goalId: 'non-existent-id',
        userId: 'user-1',
        title: 'New title',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a goal from another user', async () => {
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
        title: 'New title',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update an achieved goal', async () => {
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
        title: 'New title',
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyAchievedError)
  })

  it('should not be able to update a cancelled goal', async () => {
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
        title: 'New title',
      }),
    ).rejects.toBeInstanceOf(GoalAlreadyCancelledError)
  })

  it('should not be able to set a past deadline', async () => {
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
        userId: 'user-1',
        deadline: dayjs().subtract(1, 'day').toDate(),
      }),
    ).rejects.toBeInstanceOf(InvalidGoalDeadlineError)
  })

  it('should not be able to set target amount below current amount', async () => {
    const goal = await goalsRepository.create({
      title: 'Emergency fund',
      targetAmount: 10000,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      categoryId: null,
      deadline: dayjs().add(1, 'year').toDate(),
      userId: 'user-1',
    })

    await goalsRepository.updateProgress(goal.id, {
      currentAmount: 5000,
      status: 'IN_PROGRESS',
    })

    await expect(() =>
      sut.execute({
        goalId: goal.id,
        userId: 'user-1',
        targetAmount: 3000,
      }),
    ).rejects.toBeInstanceOf(GoalTargetAmountBelowCurrentError)
  })
})
