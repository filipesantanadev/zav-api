import { prisma } from '@/lib/prisma'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    request.log.warn({ err }, 'JWT verification failed')
    return reply.status(401).send({ message: 'Unauthorized.' })
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: { id: true },
  })

  if (!user) {
    request.log.warn(
      { sub: request.user.sub },
      'JWT sub does not match any user',
    )
    return reply.status(401).send({ message: 'Unauthorized.' })
  }
}
