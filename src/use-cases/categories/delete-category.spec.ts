import { expect, describe, it, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository'
import { DeleteCategoryUseCase } from './delete-category'

let categoriesRepository: InMemoryCategoriesRepository
let sut: DeleteCategoryUseCase

describe('Delete Category Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new DeleteCategoryUseCase(categoriesRepository)
  })

  it('should be able to delete a category', async () => {
    const category = await categoriesRepository.create({
      name: 'Food',
      color: '#B00',
      icon: 'foto.png',
      userId: 'user-1',
    })

    await sut.execute({
      id: category.id,
      userId: 'user-1',
    })

    const checkedCategory = await categoriesRepository.findById(category.id)
    expect(checkedCategory).toBeNull()
  })

  it('should not be able to delete a category created by other user', async () => {
    const category = await categoriesRepository.create({
      name: 'Food',
      color: '#B00',
      icon: 'foto.png',
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a non-existent category', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existent-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
