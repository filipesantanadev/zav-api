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

export interface FetchTransactionsFilters {
  userId: string
  page: number
  perPage: number
  type?: 'INCOME' | 'EXPENSE' | undefined
  categoryId?: string | undefined
  search?: string | undefined
  startDate?: Date | undefined
  endDate?: Date | undefined
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

export interface FetchTransactionsResponse {
  transactions: Transaction[]
  total: number
}

export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
}

export interface ExpenseByCategory {
  categoryId: string | null
  categoryName: string | null
  total: number
  percentage: number
}

export interface TransactionsRepository {
  findById(id: string): Promise<Transaction | null>
  findManyWithFilters(
    filters: FetchTransactionsFilters,
  ): Promise<FetchTransactionsResponse>
  getMonthlySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MonthlySummary>
  getExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ExpenseByCategory[]>
  create(data: CreateTransactionInput): Promise<Transaction>
  update(id: string, data: UpdateTransactionInput): Promise<Transaction>
  delete(id: string): Promise<void>
}
