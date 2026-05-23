import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { GetLast6MonthsBalanceUseCase } from './get-last-6-months-balance'
import dayjs from 'dayjs'

let transactionsRepository: InMemoryTransactionsRepository
let sut: GetLast6MonthsBalanceUseCase

describe('Get Last 6 Months Balance Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new GetLast6MonthsBalanceUseCase(transactionsRepository)
  })

  it('should be able to get last 6 months balance', async () => {
    const { last6Months } = await sut.execute({ userId: 'user-1' })

    expect(last6Months).toHaveLength(6)
  })

  it('should return months in ascending order', async () => {
    const { last6Months } = await sut.execute({ userId: 'user-1' })

    const firstMonth = last6Months[0]
    const lastMonth = last6Months[5]

    const firstDate = dayjs(`${firstMonth?.year}-${firstMonth?.month}-01`)
    const lastDate = dayjs(`${lastMonth?.year}-${lastMonth?.month}-01`)

    expect(firstDate.isBefore(lastDate)).toBe(true)
  })

  it('should calculate balance correctly for each month', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 500000,
      type: 'INCOME',
      date: dayjs().toDate(),
      userId: 'user-1',
    })

    await transactionsRepository.create({
      title: 'Rent',
      amount: 150000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
    })

    const { last6Months } = await sut.execute({ userId: 'user-1' })

    const currentMonth = last6Months[5]

    expect(currentMonth?.totalIncome).toEqual(500000)
    expect(currentMonth?.totalExpense).toEqual(150000)
    expect(currentMonth?.balance).toEqual(350000)
  })

  it('should return zero values for months without transactions', async () => {
    const { last6Months } = await sut.execute({ userId: 'user-1' })

    last6Months.forEach((month) => {
      expect(month.totalIncome).toEqual(0)
      expect(month.totalExpense).toEqual(0)
      expect(month.balance).toEqual(0)
    })
  })

  it('should not include transactions from other users', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 500000,
      type: 'INCOME',
      date: dayjs().toDate(),
      userId: 'user-2',
    })

    const { last6Months } = await sut.execute({ userId: 'user-1' })

    const currentMonth = last6Months[5]

    expect(currentMonth?.totalIncome).toEqual(0)
  })

  it('should include transactions from all 6 months', async () => {
    for (let i = 0; i < 6; i++) {
      await transactionsRepository.create({
        title: `Salary month ${i}`,
        amount: 100000,
        type: 'INCOME',
        date: dayjs().subtract(i, 'month').toDate(),
        userId: 'user-1',
      })
    }

    const { last6Months } = await sut.execute({ userId: 'user-1' })

    last6Months.forEach((month) => {
      expect(month.totalIncome).toEqual(100000)
    })
  })

  it('should not include transactions older than 6 months', async () => {
    await transactionsRepository.create({
      title: 'Old Salary',
      amount: 500000,
      type: 'INCOME',
      date: dayjs().subtract(7, 'month').toDate(),
      userId: 'user-1',
    })

    const { last6Months } = await sut.execute({ userId: 'user-1' })

    last6Months.forEach((month) => {
      expect(month.totalIncome).toEqual(0)
    })
  })
})
