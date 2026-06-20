import { expect, describe, it, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { CategoryHasActiveGoalsError } from '../errors/category-has-active-goals-error'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository'
import { InMemoryGoalsRepository } from '@/repositories/in-memory/in-memory-goals-repository'
import { DeleteCategoryUseCase } from './delete-category'
import dayjs from 'dayjs'

let categoriesRepository: InMemoryCategoriesRepository
let goalsRepository: InMemoryGoalsRepository
let sut: DeleteCategoryUseCase

describe('Delete Category Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    goalsRepository = new InMemoryGoalsRepository()
    sut = new DeleteCategoryUseCase(categoriesRepository, goalsRepository)
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

  it('should not be able to delete a category with active goals', async () => {
    const category = await categoriesRepository.create({
      name: 'Travel',
      color: '#0AF',
      icon: 'plane',
      userId: 'user-1',
    })

    await goalsRepository.create({
      title: 'Trip to Japan',
      targetAmount: 5000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'year').toDate(),
      status: 'IN_PROGRESS',
      userId: 'user-1',
      categoryId: category.id,
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(CategoryHasActiveGoalsError)
  })

  it('should be able to delete a category that only has achieved or cancelled goals', async () => {
    const category = await categoriesRepository.create({
      name: 'Electronics',
      color: '#333',
      icon: 'cpu',
      userId: 'user-1',
    })

    await goalsRepository.create({
      title: 'Buy a laptop',
      targetAmount: 2000,
      currentAmount: 2000,
      deadline: dayjs().add(1, 'month').toDate(),
      status: 'ACHIEVED',
      userId: 'user-1',
      categoryId: category.id,
    })

    await goalsRepository.create({
      title: 'Buy a phone',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: dayjs().add(1, 'month').toDate(),
      status: 'CANCELLED',
      userId: 'user-1',
      categoryId: category.id,
    })

    await sut.execute({
      id: category.id,
      userId: 'user-1',
    })

    const checkedCategory = await categoriesRepository.findById(category.id)
    expect(checkedCategory).toBeNull()
  })
})
