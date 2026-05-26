import type { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { profile } from './profile'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { refresh } from './refresh'
import {
  authenticateUserSchema,
  getUserProfileSchema,
  refreshTokenSchema,
  registerUserSchema,
} from '@/http/schemas/users'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', { schema: registerUserSchema }, register)
  app.post('/sessions', { schema: authenticateUserSchema }, authenticate)

  app.patch('/token/refresh', { schema: refreshTokenSchema }, refresh)

  app.get(
    '/me',
    { onRequest: [verifyJWT], schema: getUserProfileSchema },
    profile,
  )
}
