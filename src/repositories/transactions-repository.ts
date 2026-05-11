export interface CreateTransactionInput {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
  notes?: string | null
  userId: string
  categoryId?: string | null
}

export interface UpdateTransactionInput {
  title?: string
  amount?: number
  type?: 'INCOME' | 'EXPENSE'
  date?: Date
  notes?: string | null
  categoryId?: string | null
}

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
  notes: string | null
  userId: string
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TransactionsRepository {
  findById(id: string): Promise<Transaction | null>
  create(data: CreateTransactionInput): Promise<Transaction>
  update(id: string, data: UpdateTransactionInput): Promise<Transaction>
}
