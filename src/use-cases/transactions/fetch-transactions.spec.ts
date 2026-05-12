import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { FetchTransactionsUseCase } from './fetch-transactions'
import dayjs from 'dayjs'
import { InvalidDateRangeError } from '../errors/invalid-date-range-error'

let transactionsRepository: InMemoryTransactionsRepository
let sut: FetchTransactionsUseCase

const transactionTypes = [
  // INCOME
  {
    title: 'Salary',
    type: 'INCOME',
  },
  {
    title: 'Freelance',
    type: 'INCOME',
  },
  {
    title: 'Bonus',
    type: 'INCOME',
  },
  {
    title: 'Investment Return',
    type: 'INCOME',
  },
  {
    title: 'Cashback',
    type: 'INCOME',
  },
  {
    title: 'Gift',
    type: 'INCOME',
  },

  // EXPENSE
  {
    title: 'Rent',
    type: 'EXPENSE',
  },
  {
    title: 'Electricity Bill',
    type: 'EXPENSE',
  },
  {
    title: 'Internet',
    type: 'EXPENSE',
  },
  {
    title: 'Groceries',
    type: 'EXPENSE',
  },
  {
    title: 'Transport',
    type: 'EXPENSE',
  },
  {
    title: 'Streaming Service',
    type: 'EXPENSE',
  },
  {
    title: 'Gym',
    type: 'EXPENSE',
  },
  {
    title: 'Restaurant',
    type: 'EXPENSE',
  },
] as const

describe('Fetch Transaction (Filter and Page) Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new FetchTransactionsUseCase(transactionsRepository)
  })

  it('should be able to fetch a transactions', async () => {
    for (let i = 0; i <= 22; i++) {
      const randomTransaction =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)]!

      await transactionsRepository.create({
        title: randomTransaction.title,
        amount: Math.floor(Math.random() * 10000),
        type: randomTransaction.type,
        date: new Date(),
        userId: 'user-1',
        categoryId: 'category-1',
      })
    }

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
    })

    expect(total).toEqual(23)
    expect(transactions).toHaveLength(20)
  })

  it('should be able to fetch a transactions with filter (title)', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(3, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(2, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(1, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Freelancer',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
      search: 'Salary',
    })

    expect(total).toEqual(4)
    expect(transactions).toHaveLength(4)
  })

  it('should be able to fetch a transactions with filter (type)', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(3, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Buy a Guitar',
      amount: 5000,
      type: 'EXPENSE',
      date: dayjs().subtract(5, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Paying household bills',
      amount: 600,
      type: 'EXPENSE',
      date: dayjs().subtract(2, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Freelancer',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
      type: 'EXPENSE',
    })

    expect(total).toEqual(2)
    expect(transactions).toHaveLength(2)
  })

  it('should be able to fetch a transactions with filter (category)', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(3, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Buy a Guitar',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(5, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    await transactionsRepository.create({
      title: 'Paying household bills',
      amount: 600,
      type: 'INCOME',
      date: dayjs().subtract(2, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Salary',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    await transactionsRepository.create({
      title: 'Freelancer',
      amount: 5000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
      categoryId: 'category-2',
    })

    expect(total).toEqual(3)
    expect(transactions).toHaveLength(3)
  })

  it('should be able to fetch a transactions with range of date', async () => {
    for (let i = 2; i <= 10; i++) {
      await transactionsRepository.create({
        title: 'Transaction inside range',
        amount: 1000,
        type: 'INCOME',
        date: dayjs().subtract(i, 'days').toDate(),
        userId: 'user-1',
      })
    }

    // fora do range (hoje e há 11 dias)
    await transactionsRepository.create({
      title: 'Transaction outside range',
      amount: 1000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'day').toDate(),
      userId: 'user-1',
    })

    await transactionsRepository.create({
      title: 'Transaction outside range',
      amount: 1000,
      type: 'INCOME',
      date: dayjs().subtract(11, 'days').toDate(),
      userId: 'user-1',
    })

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
      startDate: dayjs().subtract(10, 'days').toDate(),
      endDate: dayjs().subtract(2, 'days').toDate(),
    })

    expect(total).toEqual(9)
    expect(transactions).toHaveLength(9)
  })

  it('should be able to fetch a transactions with 50 items per page', async () => {
    for (let i = 0; i <= 50; i++) {
      await transactionsRepository.create({
        title: 'Transaction inside range',
        amount: 1000,
        type: 'INCOME',
        date: dayjs().subtract(0, 'days').toDate(),
        userId: 'user-1',
      })
    }

    const { transactions, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
      perPage: 50,
    })

    expect(total).toEqual(51)
    expect(transactions).toHaveLength(50)
  })

  it('should not be able to fetch a transactions with invalid range of date', async () => {
    for (let i = 2; i <= 10; i++) {
      await transactionsRepository.create({
        title: 'Transaction inside range',
        amount: 1000,
        type: 'INCOME',
        date: dayjs().subtract(i, 'days').toDate(),
        userId: 'user-1',
      })
    }

    // fora do range (hoje e há 11 dias)
    await transactionsRepository.create({
      title: 'Transaction outside range',
      amount: 1000,
      type: 'INCOME',
      date: dayjs().subtract(0, 'day').toDate(),
      userId: 'user-1',
    })

    await transactionsRepository.create({
      title: 'Transaction outside range',
      amount: 1000,
      type: 'INCOME',
      date: dayjs().subtract(11, 'days').toDate(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        userId: 'user-1',
        page: 1,
        startDate: dayjs().subtract(2, 'days').toDate(),
        endDate: dayjs().subtract(10, 'days').toDate(),
      }),
    ).rejects.toBeInstanceOf(InvalidDateRangeError)
  })
})
