import { env } from '@/env'
import type { SwaggerOptions } from '@fastify/swagger'
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui'

interface SwaggerConfig {
  swagger: SwaggerOptions
  swaggerUi: FastifySwaggerUiOptions
}

export function swaggerPlugin(): SwaggerConfig {
  const swagger: SwaggerOptions = {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'ZAV Finances API',
        description: 'API REST de controle financeiro pessoal',
        version: '1.0.0',
      },
      servers: [
        {
          url:
            env.NODE_ENV === 'production'
              ? env.APP_URL
              : `http://localhost:${env.PORT}`,
          description:
            env.NODE_ENV === 'production'
              ? 'Production server'
              : 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT obtido no endpoint /sessions',
          },
        },
      },
      tags: [
        { name: 'Users', description: 'Gerenciamento de usuários' },
        { name: 'Transactions', description: 'Gerenciamento de transações' },
        { name: 'Categories', description: 'Gerenciamento de categorias' },
        { name: 'Goals', description: 'Gerenciamento de metas financeiras' },
        { name: 'Dashboard', description: 'Dashboard financeiro' },
      ],
    },
  }

  const swaggerUi: FastifySwaggerUiOptions = {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  }

  return { swagger, swaggerUi }
}
