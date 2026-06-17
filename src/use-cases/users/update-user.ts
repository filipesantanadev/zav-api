import type {
  PublicUser,
  UpdateUserInput,
  UsersRepository,
} from '@/repositories/users-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface UpdateUserUseCaseRequest {
  id: string
  name?: string
  email?: string
  password?: string
}

interface UpdateUserUseCaseResponse {
  user: PublicUser
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    name,
    email,
    password,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (email !== undefined) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserAlreadyExistsError()
      }
    }

    const data: UpdateUserInput = {}

    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (password !== undefined) data.passwordHash = await hash(password, 12)

    const updatedUser = await this.usersRepository.update(id, data)

    const { passwordHash: _, ...userWithoutPassword } = updatedUser

    return {
      user: userWithoutPassword,
    }
  }
}
