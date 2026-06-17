import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyRateLimit from '@fastify/rate-limit'
import { usersRoutes } from './http/controllers/users/routes'
import { transactionsRoutes } from './http/controllers/transactions/routes'
import { categoriesRoutes } from './http/controllers/categories/routes'
import { goalsRoutes } from './http/controllers/goals/routes'
import { dashboardRoutes } from './http/controllers/dashboards/routes'
import { swaggerPlugin } from './http/plugins/swagger'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export const app = fastify()

const { swagger, swaggerUi } = swaggerPlugin()

app.register(fastifySwagger, swagger)
app.register(fastifySwaggerUi, swaggerUi)
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

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: here we should log to an external tool like DataDog, NewRelic, Sentry, etc.
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
