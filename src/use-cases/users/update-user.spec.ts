import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UpdateUserUseCase } from './update-user'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserUseCase

describe('Update User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateUserUseCase(usersRepository)
  })

  it('should be able to update a user profile', async () => {
    const user = await usersRepository.create({
      name: 'John Koe',
      email: 'johndoe123@example.com',
      passwordHash: await hash('password0123', 12),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '0987654321',
    })

    expect(updatedUser.name).toEqual('John Doe')
    expect(updatedUser.email).toEqual('johndoe@example.com')
  })

  it('should be able to update only the name', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: await hash('password0123', 12),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      name: 'John Updated',
    })

    expect(updatedUser.name).toEqual('John Updated')
    expect(updatedUser.email).toEqual('johndoe@example.com')
  })

  it('should be able to update email to the same email of the user', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: await hash('password0123', 12),
    })

    await expect(
      sut.execute({
        id: user.id,
        email: 'johndoe@example.com',
      }),
    ).resolves.not.toThrow()
  })

  it('should not return passwordHash in the response', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: await hash('password0123', 12),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      name: 'John Updated',
    })

    expect(updatedUser).not.toHaveProperty('passwordHash')
  })

  it('should hash the password when updating', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: await hash('password0123', 12),
    })

    await sut.execute({
      id: user.id,
      password: 'newpassword123',
    })

    const updatedUser = await usersRepository.findById(user.id)

    expect(updatedUser?.passwordHash).not.toEqual('newpassword123')
  })

  it('should not be able to update a user profile when user non existing', async () => {
    await expect(() =>
      sut.execute({
        id: 'not-existing',
        name: 'John Doe',
        email: 'chester@example.com',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a user profile email when exists already same email', async () => {
    const user = await usersRepository.create({
      name: 'John Koe',
      email: 'johndoe@example.com',
      passwordHash: await hash('password0123', 12),
    })

    await usersRepository.create({
      name: 'Chester Tyler',
      email: 'chester@example.com',
      passwordHash: await hash('password0123', 12),
    })

    await expect(() =>
      sut.execute({
        id: user.id,
        name: 'John Chester Doe',
        email: 'chester@example.com',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
