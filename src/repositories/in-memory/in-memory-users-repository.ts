import type { User, Prisma } from '@prisma/client'
import type { UpdateUserInput, UsersRepository } from '../users-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async update(id: string, data: UpdateUserInput) {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]!

    const updated = {
      id,
      name: data.name ?? current.name,
      email: data.email ?? current.email,
      passwordHash: data.passwordHash ?? current.passwordHash,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    }

    this.items[index] = updated
    return updated
  }

  async create(data: Prisma.UserCreateInput) {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(user)

    return user
  }
}
