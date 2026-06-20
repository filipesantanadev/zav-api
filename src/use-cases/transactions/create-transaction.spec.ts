import { expect, describe, it, beforeEach, vi } from 'vitest'
import { CreateTransactionUseCase } from './create-transaction'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import dayjs from 'dayjs'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'
import type { CacheService } from '@/infra/cache/cache.service'

let transactionsRepository: InMemoryTransactionsRepository
let cacheService: CacheService
let sut: CreateTransactionUseCase

describe('Create Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    cacheService = { deleteByPattern: vi.fn() } as unknown as CacheService
    sut = new CreateTransactionUseCase(transactionsRepository, cacheService)
  })

  it('should be able to create a transaction', async () => {
    const { transaction } = await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    expect(transaction.id).toEqual(expect.any(String))
  })

  it('should be able to create a transaction without category', async () => {
    const { transaction } = await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      // sem categoryId
    })

    expect(transaction.categoryId).toBeNull()
  })

  it('should be able to create an expense transaction', async () => {
    const { transaction } = await sut.execute({
      title: 'Rent',
      amount: 1500,
      type: 'EXPENSE',
      date: new Date(),
      userId: 'user-1',
    })

    expect(transaction.type).toEqual('EXPENSE')
  })

  it('should be able to create a transaction with today date', async () => {
    const { transaction } = await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().toDate(), // ← hoje deve ser permitido
      userId: 'user-1',
    })

    expect(transaction.id).toEqual(expect.any(String))
  })

  it('should be able to create a transaction with a past date', async () => {
    const { transaction } = await sut.execute({
      title: 'Old Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(1, 'month').toDate(), // ← data passada é válida
      userId: 'user-1',
    })

    expect(transaction.id).toEqual(expect.any(String))
  })

  it('should not be able to create a transaction with zero amount', async () => {
    await expect(() =>
      sut.execute({
        title: 'Salary',
        amount: 0, // ← zero também é inválido (RN05)
        type: 'INCOME',
        date: new Date(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionAmountError)
  })

  it('should persist transaction in repository', async () => {
    await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
    })

    expect(transactionsRepository.items).toHaveLength(1)
    expect(transactionsRepository.items[0]?.userId).toEqual('user-1')
  })

  it('should not be able to create a transaction with invalid amount', async () => {
    await expect(() =>
      sut.execute({
        title: 'Salary',
        amount: -5000,
        type: 'INCOME',
        date: new Date(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionAmountError)
  })

  it('should not be able to create a transaction with a future date', async () => {
    await expect(() =>
      sut.execute({
        title: 'Salary',
        amount: 5000,
        type: 'INCOME',
        date: dayjs().add(1, 'day').toDate(), // ← amanhã
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(FutureDateTransactionError)
  })

  it('should invalidate dashboard cache after creating a transaction', async () => {
    await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
    })

    expect(cacheService.deleteByPattern).toHaveBeenCalledOnce()
    expect(cacheService.deleteByPattern).toHaveBeenCalledWith(
      'dashboard:user-1:*',
    )
  })

  it('should not invalidate cache when transaction creation fails', async () => {
    await expect(() =>
      sut.execute({
        title: 'Salary',
        amount: -100,
        type: 'INCOME',
        date: new Date(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionAmountError)

    expect(cacheService.deleteByPattern).not.toHaveBeenCalled()
  })

  it('should not invalidate cache when creation fails due to future date', async () => {
    await expect(() =>
      sut.execute({
        title: 'Salary',
        amount: 5000,
        type: 'INCOME',
        date: dayjs().add(1, 'day').toDate(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(FutureDateTransactionError)

    expect(cacheService.deleteByPattern).not.toHaveBeenCalled()
  })

  it('should succeed even when cache invalidation throws', async () => {
    vi.mocked(cacheService.deleteByPattern).mockRejectedValueOnce(
      new Error('Redis unavailable'),
    )

    const { transaction } = await sut.execute({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
    })

    expect(transaction.id).toEqual(expect.any(String))
    expect(transactionsRepository.items).toHaveLength(1)
  })
})
