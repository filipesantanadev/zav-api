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
    await transactionsRepository.create({
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

  it('should always sum percentages to 100 (largest-remainder rounding)', async () => {
    // 333 + 333 + 334 = 1000; naive Math.round gives 33+33+33=99
    await transactionsRepository.create({
      title: 'A',
      amount: 333,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-1',
    })

    await transactionsRepository.create({
      title: 'B',
      amount: 333,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-2',
    })

    await transactionsRepository.create({
      title: 'C',
      amount: 334,
      type: 'EXPENSE',
      date: dayjs().toDate(),
      userId: 'user-1',
      categoryId: 'category-3',
    })

    const { expensesByCategory } = await sut.execute({
      userId: 'user-1',
      month: dayjs().month() + 1,
      year: dayjs().year(),
    })

    const sum = expensesByCategory.reduce((acc, e) => acc + e.percentage, 0)
    expect(sum).toEqual(100)

    // category-3 has the largest fractional part (33.4%) so it receives the +1
    const a = expensesByCategory.find((e) => e.categoryId === 'category-1')
    const b = expensesByCategory.find((e) => e.categoryId === 'category-2')
    const c = expensesByCategory.find((e) => e.categoryId === 'category-3')
    expect(a?.percentage).toEqual(33)
    expect(b?.percentage).toEqual(33)
    expect(c?.percentage).toEqual(34)
  })
})
