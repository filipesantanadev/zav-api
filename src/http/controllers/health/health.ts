// Direct imports of prisma and redis are intentional here: the health endpoint
// probes infrastructure directly without business logic, so a use case / factory
// layer would add boilerplate with no benefit.
import { prisma } from '@/lib/prisma'
import { redis } from '@/infra/cache/redis.service'
import type { FastifyReply, FastifyRequest } from 'fastify'

type ServiceStatus = { status: 'UP' } | { status: 'DOWN'; error: string }

function toMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Unavailable'

  // Walk the full cause chain to find the root error message
  const parts: string[] = []
  let current: unknown = err
  while (current instanceof Error) {
    parts.push(current.message)
    current = current.cause
  }
  const full = parts.join(' ')

  if (full.includes('ECONNREFUSED')) return 'Connection refused'
  if (full.includes('ETIMEDOUT') || full.includes('timed out'))
    return 'Connection timed out'
  if (full.includes('ENOTFOUND')) return 'Host not found'
  if (full.includes('P1001') || full.includes("Can't reach database"))
    return 'Connection refused'
  if (full.includes('P1002')) return 'Connection timed out'

  return 'Unavailable'
}

export async function health(_request: FastifyRequest, reply: FastifyReply) {
  const services: { database: ServiceStatus; cache: ServiceStatus } = {
    database: { status: 'UP' },
    cache: { status: 'UP' },
  }

  await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`.catch((err: unknown) => {
      services.database = { status: 'DOWN', error: toMessage(err) }
    }),
    redis.ping().catch((err: unknown) => {
      services.cache = { status: 'DOWN', error: toMessage(err) }
    }),
  ])

  const isHealthy =
    services.database.status === 'UP' && services.cache.status === 'UP'
  const httpStatus = isHealthy ? 200 : 503

  return reply.status(httpStatus).send({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    services,
  })
}
