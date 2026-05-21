import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { UpdateTransactionUseCase } from './update-transaction'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import dayjs from 'dayjs'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'

let transactionsRepository: InMemoryTransactionsRepository
let sut: UpdateTransactionUseCase

describe('Update Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new UpdateTransactionUseCase(transactionsRepository)
  })

  it('should be able to update a transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
      title: 'Updated Salary',
      amount: 6000,
      categoryId: 'category-2',
    })

    expect(updatedTransaction.title).toEqual('Updated Salary')
    expect(updatedTransaction.amount).toEqual(6000)
    expect(updatedTransaction.categoryId).toEqual('category-2')
  })

  it('should be able to update a type of transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
      title: 'Buy a new Guitar',
      amount: 6000,
      type: 'EXPENSE',
    })

    expect(updatedTransaction.title).toEqual('Buy a new Guitar')
    expect(updatedTransaction.amount).toEqual(6000)
    expect(updatedTransaction.type).toEqual('EXPENSE')
  })

  it('should be able to update a note of transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Freelancer Project Node.js - Google',
      amount: 5000,
      type: 'INCOME',
      notes: 'Received payment for the project I did for G',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
      notes: 'Received payment for the project I did for Google',
    })

    expect(updatedTransaction.title).toEqual(
      'Freelancer Project Node.js - Google',
    )
    expect(updatedTransaction.amount).toEqual(5000)
    expect(updatedTransaction.type).toEqual('INCOME')
    expect(updatedTransaction.notes).toEqual(
      'Received payment for the project I did for Google',
    )
  })

  it('should be able to not update a transaction without providing any updates', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
    })

    expect(updatedTransaction.amount).toEqual(5000)
  })

  it('should be able to update a transaction with a past date', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
      date: dayjs().subtract(1, 'month').toDate(),
    })

    expect(updatedTransaction.id).toEqual(expect.any(String))
  })

  it('should be able to remove category from transaction', async () => {
    const transaction = await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transaction: updatedTransaction } = await sut.execute({
      id: transaction.id,
      userId: 'user-1',
      categoryId: null,
    })

    expect(updatedTransaction.categoryId).toBeNull()
  })

  it('should not be able to update a transaction that does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        userId: 'user-1',
        title: 'New Title',
        type: 'EXPENSE',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a transaction with transaction created by another user', async () => {
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
        title: 'Buy a new Guitar',
        amount: 0,
        type: 'EXPENSE',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a transaction with amount is zero', async () => {
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
        userId: 'user-1',
        title: 'Buy a new Guitar',
        amount: 0,
        type: 'EXPENSE',
      }),
    ).rejects.toBeInstanceOf(InvalidTransactionAmountError)
  })

  it('should not be able to update a transaction with a future date', async () => {
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
        userId: 'user-1',
        date: dayjs().add(1, 'day').toDate(),
      }),
    ).rejects.toBeInstanceOf(FutureDateTransactionError)
  })
})
