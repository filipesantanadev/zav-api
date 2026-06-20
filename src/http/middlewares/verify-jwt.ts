import type { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    request.log.warn({ err }, 'JWT verification failed')
    return reply.status(401).send({ message: 'Unauthorized.' })
  }
}
