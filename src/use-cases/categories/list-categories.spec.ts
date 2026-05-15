import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository'
import { ListCategoriesUseCase } from './list-categories'

let categoriesRepository: InMemoryCategoriesRepository
let sut: ListCategoriesUseCase

describe('List Categories Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new ListCategoriesUseCase(categoriesRepository)
  })

  it('should be able to fetch a categories', async () => {
    for (let i = 0; i <= 20; i++) {
      await categoriesRepository.create({
        name: 'title-' + `${i}`,
        color: '#B00',
        icon: 'icon-photo.png',
        userId: 'user-1',
      })
    }

    await categoriesRepository.create({
      name: 'Hobbies',
      color: 'rgb(226, 174, 236)',
      icon: 'icon-hobbies.png',
      userId: 'user-2',
    })

    const { categories, total } = await sut.execute({
      userId: 'user-1',
      page: 1,
    })

    expect(total).toEqual(21)
    expect(categories).toHaveLength(20)
  })

  it('should not be able to fetch a categories created by another user', async () => {
    for (let i = 0; i <= 20; i++) {
      await categoriesRepository.create({
        name: 'title-' + `${i}`,
        color: '#B00',
        icon: 'icon-photo.png',
        userId: 'user-1',
      })
    }

    const { categories, total } = await sut.execute({
      userId: 'user-2',
      page: 1,
    })

    expect(total).toEqual(0)
    expect(categories).toHaveLength(0)
  })
})
