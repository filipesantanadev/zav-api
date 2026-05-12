import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { GetMonthlySummaryUseCase } from './get-monthly-summary'

let transactionsRepository: InMemoryTransactionsRepository
let sut: GetMonthlySummaryUseCase

describe('Get Monthly Summary Transaction Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new GetMonthlySummaryUseCase(transactionsRepository)
  })

  it('should be able to get a monthly summary transactions', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 10000,
      type: 'INCOME',
      date: new Date('2026-03-05'),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 10000,
      type: 'INCOME',
      date: new Date('2026-04-05'),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Investment Return',
      amount: 450,
      type: 'INCOME',
      date: new Date('2026-04-18'),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Rent',
      amount: 1800,
      type: 'EXPENSE',
      date: new Date('2026-04-01'),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const result = await sut.execute({
      userId: 'user-1',
      month: 4,
      year: 2026,
    })

    expect(result.totalIncome).toBe(10450)
    expect(result.totalExpense).toBe(1800)
    expect(result.balance).toBe(8650)
    expect(result.month).toBe(4)
    expect(result.year).toBe(2026)
  })
})
