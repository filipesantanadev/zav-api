import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { GetExpensesByCategoryUseCase } from './get-expenses-by-category'
import dayjs from 'dayjs'

let transactionsRepository: InMemoryTransactionsRepository
let sut: GetExpensesByCategoryUseCase

describe('Get Expenses By Category Use Case', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository()
    sut = new GetExpensesByCategoryUseCase(transactionsRepository)
  })

  it('should be able to get expenses by category', async () => {
    await transactionsRepository.create({
      title: 'Mercado',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Uber',
      amount: 10000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(2)
    expect(expensesByCategory[0]?.total).toEqual(30000)
    expect(expensesByCategory[1]?.total).toEqual(10000)
  })

  it('should handle transactions without category', async () => {
    const created = await transactionsRepository.create({
      title: 'Despesa sem categoria',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: null,
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(1)
    expect(expensesByCategory[0]?.categoryId).toBeNull()
  })

  it('should return zero percentage when total expenses is zero', async () => {
    // força o cenário onde grouped tem itens mas totalExpenses = 0
    // isso acontece quando amount = 0 — mas nossa RN05 bloqueia isso no use-case
    // no in-memory podemos inserir direto no repositório
    transactionsRepository.items.push({
      id: 'transaction-1',
      title: 'Despesa zero',
      amount: 0, // ← força o cenário
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory[0]?.percentage).toEqual(0)
  })

  it('should calculate percentage correctly', async () => {
    await transactionsRepository.create({
      title: 'Mercado',
      amount: 75000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Uber',
      amount: 25000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory[0]?.percentage).toEqual(75)
    expect(expensesByCategory[1]?.percentage).toEqual(25)
  })

  it('should not include income transactions', async () => {
    await transactionsRepository.create({
      title: 'Salary',
      amount: 500000,
      type: 'INCOME',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Mercado',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(1)
    expect(expensesByCategory[0]?.categoryId).toEqual('category-2')
  })

  it('should not include transactions from other users', async () => {
    await transactionsRepository.create({
      title: 'Mercado',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-2',
      categoryId: 'category-1',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(0)
  })

  it('should not include transactions outside the month range', async () => {
    await transactionsRepository.create({
      title: 'Mercado',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().subtract(2, 'month').toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(0)
  })

  it('should group transactions from same category', async () => {
    await transactionsRepository.create({
      title: 'Mercado 1',
      amount: 20000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'Mercado 2',
      amount: 30000,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(1)
    expect(expensesByCategory[0]?.total).toEqual(50000)
    expect(expensesByCategory[0]?.percentage).toEqual(100)
  })

  it('should return empty when no expenses', async () => {
    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    expect(expensesByCategory).toHaveLength(0)
  })
})
