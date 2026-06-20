import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  email = 'johndoe@example.com',
) {
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email,
      passwordHash: await hash('password0123', 12),
    },
  })

  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password: 'password0123',
  })

  const { token } = authResponse.body

  return { token }
}
