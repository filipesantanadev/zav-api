import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeUpdateUserUseCase } from '@/use-cases/factories/users/make-update-user-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updateProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateProfileBodySchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  })

  const { name, email, password } = updateProfileBodySchema.parse(request.body)

  try {
    const updateUserUseCase = makeUpdateUserUseCase()

    const { user } = await updateUserUseCase.execute({
      id: request.user.sub,
      name,
      email,
      password,
    })

    return reply.status(200).send({ user })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
