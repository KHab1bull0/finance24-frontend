import api from './axios'
import type { Category } from './categories'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  note: string | null
  date: string
  createdAt: string
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
}

export interface PaginatedTransactions {
  data: Transaction[]
  hasMore: boolean
  page: number
  limit: number
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense'
  categoryId?: string
  search?: string
}

export interface CreateTransactionDto {
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  date: string
  note?: string
}

export const fetchTransactions = async (
  filters: TransactionFilters,
  page = 1,
  limit = 20,
): Promise<PaginatedTransactions> => {
  const { data } = await api.get<PaginatedTransactions>('/transactions', {
    params: { ...filters, page, limit },
  })
  return data
}

export const createTransaction = async (dto: CreateTransactionDto): Promise<Transaction> => {
  const { data } = await api.post<Transaction>('/transactions', dto)
  return data
}

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`)
}
