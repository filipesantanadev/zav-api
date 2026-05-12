import dayjs from 'dayjs'
import type {
  CreateTransactionInput,
  TransactionsRepository,
  Transaction,
  UpdateTransactionInput,
  FetchTransactionsFilters,
} from '../transactions-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items: Transaction[] = []

  async findById(id: string) {
    const transaction = this.items.find((item) => item.id === id)

    if (!transaction) {
      return null
    }

    return transaction
  }

  async findManyWithFilters(filters: FetchTransactionsFilters) {
    let transactions = this.items.filter(
      (item) => item.userId === filters.userId,
    )

    if (filters.type) {
      transactions = transactions.filter((item) => item.type === filters.type)
    }

    if (filters.categoryId) {
      transactions = transactions.filter(
        (item) => item.categoryId === filters.categoryId,
      )
    }

    if (filters.search) {
      transactions = transactions.filter((item) =>
        item.title.toLowerCase().includes(filters.search!.toLowerCase()),
      )
    }

    if (filters.startDate) {
      transactions = transactions.filter((item) =>
        dayjs(item.date).isAfter(dayjs(filters.startDate).subtract(1, 'day')),
      )
    }

    if (filters.endDate) {
      transactions = transactions.filter((item) =>
        dayjs(item.date).isBefore(dayjs(filters.endDate).add(1, 'day')),
      )
    }

    const total = transactions.length

    const paginated = transactions.slice(
      (filters.page - 1) * filters.perPage,
      filters.page * filters.perPage,
    )

    return {
      transactions: paginated,
      total,
    }
  }

  async create(data: CreateTransactionInput) {
    const transaction: Transaction = {
      id: randomUUID(),
      title: data.title,
      amount: data.amount,
      type: data.type,
      date: new Date(data.date),
      notes: data.notes ?? null,
      userId: data.userId,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(transaction)

    return transaction
  }

  async update(id: string, data: UpdateTransactionInput) {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]!

    const updated: Transaction = {
      id,
      title: data.title ?? current.title,
      amount: data.amount ?? current.amount,
      type: data.type ?? current.type,
      date: data.date ?? current.date,
      notes: data.notes !== undefined ? data.notes : current.notes,
      userId: current.userId,
      categoryId:
        data.categoryId !== undefined ? data.categoryId : current.categoryId,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    }

    this.items[index] = updated
    return updated
  }
}
