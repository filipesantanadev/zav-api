import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import { usersRoutes } from './http/controllers/users/routes'
import { transactionsRoutes } from './http/controllers/transactions/routes'
import { categoriesRoutes } from './http/controllers/categories/routes'
import { goalsRoutes } from './http/controllers/goals/routes'
import { dashboardRoutes } from './http/controllers/dashboards/routes'
import { swaggerPlugin } from './http/plugins/swagger'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { logger } from './lib/logger'

export const app = fastify({ logger })

const { swagger, swaggerUi } = swaggerPlugin()

app.register(fastifySwagger, swagger)
app.register(fastifySwaggerUi, swaggerUi)
app.register(fastifyCors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
})
app.register(fastifyRateLimit, {
  global: false,
})
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})

app.register(fastifyCookie)

app.register(usersRoutes)
app.register(transactionsRoutes)
app.register(categoriesRoutes)
app.register(goalsRoutes)
app.register(dashboardRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ message: error.message })
  }

  app.log.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})
