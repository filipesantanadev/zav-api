import type { Prisma, User } from '@prisma/client'

export type PublicUser = Omit<User, 'passwordHash'>

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
}
