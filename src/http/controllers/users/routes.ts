import type { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { profile } from './profile'
import { updateProfile } from './update-profile'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { refresh } from './refresh'
import {
  authenticateUserSchema,
  getUserProfileSchema,
  refreshTokenSchema,
  registerUserSchema,
  updateUserProfileSchema,
} from '@/http/schemas/users'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: registerUserSchema,
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    register,
  )
  app.post(
    '/sessions',
    {
      schema: authenticateUserSchema,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    authenticate,
  )

  app.patch(
    '/token/refresh',
    {
      schema: refreshTokenSchema,
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    refresh,
  )

  app.get(
    '/me',
    { onRequest: [verifyJWT], schema: getUserProfileSchema },
    profile,
  )

  app.patch(
    '/me',
    { onRequest: [verifyJWT], schema: updateUserProfileSchema },
    updateProfile,
  )
}
