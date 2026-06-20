import { prisma } from '@/lib/prisma'
import type {
  CreateTransactionInput,
  ExpenseByCategory,
  FetchTransactionsFilters,
  Transaction,
  TransactionsRepository,
  UpdateTransactionInput,
} from '../transactions-repository'
import { Prisma } from '@prisma/client'
import { largestRemainder } from '@/utils/largest-remainder'

export class PrismaTransactionsRepository implements TransactionsRepository {
  // ← converte Decimal → number em todos os métodos
  private toTransaction(raw: {
    id: string
    title: string
    amount: { toNumber(): number }
    type: 'INCOME' | 'EXPENSE'
    date: Date
    notes: string | null
    userId: string
    categoryId: string | null
    createdAt: Date
    updatedAt: Date
  }): Transaction {
    return {
      ...raw,
      amount: raw.amount.toNumber(),
    }
  }

  async findById(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } })
    if (!transaction) return null
    return this.toTransaction(transaction)
  }

  async findManyWithFilters(filters: FetchTransactionsFilters) {
    const where = {
      userId: filters.userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search && {
        title: {
          contains: filters.search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...((filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate }),
        },
      }),
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
      }),
      prisma.transaction.count({ where }),
    ])

    return {
      transactions: transactions.map(this.toTransaction.bind(this)),
      total,
    }
  }

  async getMonthlySummary(userId: string, startDate: Date, endDate: Date) {
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ])

    return {
      totalIncome: income._sum.amount?.toNumber() ?? 0,
      totalExpense: expense._sum.amount?.toNumber() ?? 0,
    }
  }

  async getExpensesByCategory(userId: string, startDate: Date, endDate: Date) {
    interface RawRow {
      categoryId: string | null
      categoryName: string | null
      total: number
    }

    // Single query: JOIN eliminates the separate category name lookup
    const rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        t.category_id         AS "categoryId",
        c.name                AS "categoryName",
        SUM(t.amount)::float8 AS total
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id  = ${userId}
        AND t.type::text = 'EXPENSE'
        AND t.date >= ${startDate}
        AND t.date <= ${endDate}
      GROUP BY t.category_id, c.name
      ORDER BY total DESC
    `

    const totalExpenses = rows.reduce((acc, row) => acc + row.total, 0)
    const percentages = largestRemainder(
      rows.map((r) => r.total),
      totalExpenses,
    )

    return rows.map((row, i) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      total: row.total,
      percentage: percentages[i]!,
    }))
  }

  async create(data: CreateTransactionInput) {
    const transaction = await prisma.transaction.create({
      data: {
        title: data.title,
        amount: data.amount,
        type: data.type,
        date: data.date,
        notes: data.notes ?? null,
        userId: data.userId,
        categoryId: data.categoryId ?? null,
      },
    })
    return this.toTransaction(transaction)
  }

  async update(id: string, data: UpdateTransactionInput) {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
    })
    return this.toTransaction(transaction)
  }

  async delete(id: string) {
    await prisma.transaction.delete({ where: { id } })
  }
}
