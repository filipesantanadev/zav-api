import { expect, describe, it, beforeEach } from 'vitest'
import { CreateTransactionUseCase } from './create-transaction'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { InvalidTransactionAmountError } from '../errors/invalid-transaction-amount-error'
import dayjs from 'dayjs'
import { FutureDateTransactionError } from '../errors/future-date-transaction-error'

let transactionsRepository: InMemoryTransactionsRepository
let sut: CreateTransactionUseCase

describe('Create Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new CreateTransactionUseCase(transactionsRepository)
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
})
