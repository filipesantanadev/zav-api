import type { FastifyServerOptions } from 'fastify'
import { env } from '@/env'

const redact: string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
]

const DB_CREDS_PATTERN = /postgresql:\/\/[^:]+:[^@]+@/gi

const serializers = {
  err: (err: Error & { statusCode?: number; code?: string }) => ({
    type: err.constructor?.name ?? 'Error',
    message: err.message?.replace(DB_CREDS_PATTERN, 'postgresql://[REDACTED]@'),
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
  }),
}

const loggerOptions: Record<string, FastifyServerOptions['logger']> = {
  development: {
    level: 'info',
    redact,
    serializers,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    },
  },
  production: {
    level: 'warn',
    redact,
    serializers,
  },
  test: {
    level: 'silent',
  },
}

export const logger = loggerOptions[env.NODE_ENV]
