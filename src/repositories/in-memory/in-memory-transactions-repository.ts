import type {
  CreateTransactionInput,
  TransactionsRepository,
  Transaction,
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
}
