import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { DeleteTransactionUseCase } from './delete-transaction'

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

    const deleteTransaction = await sut.execute({
      id: transaction.id,
    })

    expect(deleteTransaction).toBeTruthy()
    expect(deleteTransaction.transaction.id).toEqual(transaction.id)
  })

  it('should not be able to delete a non-existent transaction', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
