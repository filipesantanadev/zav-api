import { expect, describe, it, beforeEach, vi } from 'vitest'
import { GetDashboardUseCase } from './get-dashboard'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import type { CacheService } from '@/infra/cache/cache.service'
import dayjs from 'dayjs'

let transactionsRepository: InMemoryTransactionsRepository
let goalsRepository: InMemoryGoalsRepository
let cacheService: CacheService
let sut: GetDashboardUseCase

const CURRENT_MONTH = dayjs().month() + 1
const CURRENT_YEAR = dayjs().year()

describe('Get Dashboard Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    goalsRepository = new InMemoryGoalsRepository()
    cacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      deleteByPattern: vi.fn(),
    } as unknown as CacheService
    sut = new GetDashboardUseCase(
      transactionsRepository,
      goalsRepository,
      cacheService,
    )
  })

  it('should return dashboard data with correct monthly summary', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: null,
    })

    await transactionsRepository.create({
      title: 'Rent',
      amount: 1500,
      type: 'EXPENSE',
      date: new Date(),
      userId: 'user-1',
      categoryId: null,
    })

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.summary.totalIncome).toBe(5000)
    expect(result.summary.totalExpense).toBe(1500)
    expect(result.summary.balance).toBe(3500)
    expect(result.summary.month).toBe(CURRENT_MONTH)
    expect(result.summary.year).toBe(CURRENT_YEAR)
  })

  it('should return last 6 months data', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.last6Months).toHaveLength(6)
    result.last6Months.forEach((entry) => {
      expect(entry).toHaveProperty('month')
      expect(entry).toHaveProperty('year')
      expect(entry).toHaveProperty('totalIncome')
      expect(entry).toHaveProperty('totalExpense')
      expect(entry).toHaveProperty('balance')
    })
  })

  it('should return goals data', async () => {
    await goalsRepository.create({
      title: 'Buy a car',
      targetAmount: 30000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'year').toDate(),
      status: 'IN_PROGRESS',
      userId: 'user-1',
      categoryId: null,
    })

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.goals.total).toBe(1)
    expect(result.goals.items).toHaveLength(1)
  })

  it('should return cached data when cache hit occurs', async () => {
    const cachedData = {
      summary: {
        totalIncome: 9999,
        totalExpense: 0,
        balance: 9999,
        month: CURRENT_MONTH,
        year: CURRENT_YEAR,
      },
      goals: { items: [], total: 0 },
      expensesByCategory: [],
      last6Months: [],
    }
    vi.mocked(cacheService.get).mockResolvedValueOnce(cachedData)

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.summary.totalIncome).toBe(9999)
    expect(cacheService.set).not.toHaveBeenCalled()
  })

  it('should write result to cache after a cache miss', async () => {
    await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(cacheService.set).toHaveBeenCalledOnce()
    expect(cacheService.set).toHaveBeenCalledWith(
      `dashboard:user-1:${CURRENT_MONTH}:${CURRENT_YEAR}`,
      expect.any(Object),
      300,
    )
  })

  it('should continue when cache read throws', async () => {
    vi.mocked(cacheService.get).mockRejectedValueOnce(
      new Error('Redis unavailable'),
    )

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.summary).toBeDefined()
  })

  it('should return data even when cache write throws', async () => {
    vi.mocked(cacheService.set).mockRejectedValueOnce(
      new Error('Redis unavailable'),
    )

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.summary).toBeDefined()
  })

  it('should not return data from other users', async () => {
    await transactionsRepository.create({
      title: 'Other user salary',
      amount: 99999,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-2',
      categoryId: null,
    })

    const result = await sut.execute({
      userId: 'user-1',
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    })

    expect(result.summary.totalIncome).toBe(0)
  })
})
