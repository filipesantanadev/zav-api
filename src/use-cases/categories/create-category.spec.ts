import { expect, describe, it, beforeEach } from 'vitest'
import { CreateCategoryUseCase } from './create-category'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let categoriesRepository: InMemoryCategoriesRepository
let sut: CreateCategoryUseCase

describe('Create Category Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new CreateCategoryUseCase(categoriesRepository)
  })

  it('should be able to create a category', async () => {
    const { category } = await sut.execute({
      name: 'Food',
      color: '#B00',
      icon: 'foto.png',
      userId: 'user-1',
    })

    expect(category.id).toEqual(expect.any(String))
    expect(category.name).toEqual('Food')
  })

  it('should not be able to create a category when category name already exists', async () => {
    await sut.execute({
      name: 'Food',
      color: '#B00',
      icon: 'foto.png',
      userId: 'user-1',
    })
    await expect(() =>
      sut.execute({
        name: 'Food',
        color: '#B00',
        icon: 'foto.png',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
