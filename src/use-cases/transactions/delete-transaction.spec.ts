import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { DeleteTransactionUseCase } from './delete-transaction'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let transactionsRepository: InMemoryTransactionsRepository
let sut: DeleteTransactionUseCase

describe('Delete Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new DeleteTransactionUseCase(transactionsRepository)
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
    ).rejects.toBeInstanceOf(Error)
  })
})
