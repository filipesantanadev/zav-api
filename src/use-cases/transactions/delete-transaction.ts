import type { TransactionsRepository } from '@/repositories/transactions-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import type { CacheService } from '@/infra/cache/cache.service'

interface DeleteTransactionUseCaseRequest {
  id: string
  userId: string
}

export class DeleteTransactionUseCase {
  constructor(
    private transactionsRepository: TransactionsRepository,
    private cacheService: CacheService,
  ) {}

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

    try {
      await this.cacheService.deleteByPattern(`dashboard:${userId}:*`)
    } catch {
      // cache invalidation is best-effort; a Redis failure must not abort a successful write
    }
  }
}
