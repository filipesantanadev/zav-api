import type { TransactionsRepository } from '@/repositories/transactions-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteTransactionUseCaseRequest {
  id: string
  userId: string
}

export class DeleteTransactionUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    id,
    userId,
  }: DeleteTransactionUseCaseRequest): Promise<void> {
    const transaction = await this.transactionsRepository.findById(id)

    if (!transaction) {
      throw new ResourceNotFoundError()
    }

    if (transaction.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    await this.transactionsRepository.delete(id)
  }
}
