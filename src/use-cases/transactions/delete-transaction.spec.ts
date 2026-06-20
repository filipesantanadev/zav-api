import { expect, describe, it, beforeEach, vi } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { DeleteTransactionUseCase } from './delete-transaction'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import type { CacheService } from '@/infra/cache/cache.service'

let transactionsRepository: InMemoryTransactionsRepository
let cacheService: CacheService
let sut: DeleteTransactionUseCase

describe('Delete Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    cacheService = { deleteByPattern: vi.fn() } as unknown as CacheService
    sut = new DeleteTransactionUseCase(transactionsRepository, cacheService)
  })

  it('should be able to delete a transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await sut.execute({
      id: transaction.id,
      userId: 'user-1',
    })

    const checkedTransaction = await transactionsRepository.findById(
      transaction.id,
    )
    expect(checkedTransaction).toBeNull()
  })

  it('should not be able to delete a transaction created by other user', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await expect(() =>
      sut.execute({
        id: transaction.id,
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a non-existent transaction', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should invalidate dashboard cache after deleting a transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await sut.execute({
      id: transaction.id,
      userId: 'user-1',
    })

    expect(cacheService.deleteByPattern).toHaveBeenCalledOnce()
    expect(cacheService.deleteByPattern).toHaveBeenCalledWith(
      'dashboard:user-1:*',
    )
  })

  it('should not invalidate cache when deletion fails', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(cacheService.deleteByPattern).not.toHaveBeenCalled()
  })

  it('should succeed even when cache invalidation throws', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    vi.mocked(cacheService.deleteByPattern).mockRejectedValueOnce(
      new Error('Redis unavailable'),
    )

    await sut.execute({ id: transaction.id, userId: 'user-1' })

    expect(await transactionsRepository.findById(transaction.id)).toBeNull()
  })
})
