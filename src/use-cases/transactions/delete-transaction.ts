import type {
  Transaction,
  TransactionsRepository,
} from '@/repositories/transactions-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteTransactionUseCaseRequest {
  id: string
}

interface DeleteTransactionUseCaseResponse {
  transaction: Transaction
}

export class DeleteTransactionUseCase {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async execute({
    id,
  }: DeleteTransactionUseCaseRequest): Promise<DeleteTransactionUseCaseResponse> {
    const transaction = await this.transactionsRepository.findById(id)

    if (!transaction) {
      throw new ResourceNotFoundError()
    }

    return {
      transaction,
    }
  }
}
