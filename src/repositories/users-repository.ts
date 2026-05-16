import type { Prisma, User } from '@prisma/client'

export type PublicUser = Omit<User, 'passwordHash'>

export interface UpdateUserInput {
  name?: string | undefined
  email?: string | undefined
  passwordHash?: string | undefined
}

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: UpdateUserInput): Promise<User>
  create(data: Prisma.UserCreateInput): Promise<User>
}
