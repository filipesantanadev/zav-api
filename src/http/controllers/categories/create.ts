import { makeCreateCategoryUseCase } from '@/use-cases/factories/categories/make-create-category-use-case'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryBodySchema = z.object({
    name: z.string(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color'),
    icon: z.coerce.string(),
  })

  const { name, color, icon } = createCategoryBodySchema.parse(request.body)

  const createCategoryUseCase = makeCreateCategoryUseCase()

  const category = await createCategoryUseCase.execute({
    userId: request.user.sub,
    name,
    color,
    icon,
  })

  return reply.status(201).send(category)
}
