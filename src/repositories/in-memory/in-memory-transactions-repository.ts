import type {
  CreateTransactionInput,
  Transaction,
  TransactionsRepository,
} from '../transactions-repository'
import { randomUUID } from 'crypto'

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items: Transaction[] = []

  async create(data: CreateTransactionInput): Promise<Transaction> {
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
