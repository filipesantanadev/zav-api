import { makeGetDashboardUseCase } from '@/use-cases/factories/dashboards/make-get-dashboard-use-case'
import dayjs from 'dayjs'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import z from 'zod'

export async function getDashboard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getDashboardQuerySchema = z.object({
    month: z.coerce
      .number()
      .min(1)
      .max(12)
      .default(dayjs().month() + 1),
    year: z.coerce.number().default(dayjs().year()),
  })

  const userId = request.user.sub
  const { month, year } = getDashboardQuerySchema.parse(request.query)

  const getDashboard = makeGetDashboardUseCase()
  const dashboardData = await getDashboard.execute({ userId, month, year })

  return reply.status(200).send(dashboardData)
}
