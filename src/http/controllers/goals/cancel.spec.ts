import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'

describe('Cancel Goal (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to cancel a goal', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const goalCreated = await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Professional Bike',
        targetAmount: 10000,
        deadline: dayjs().add(16, 'month'),
      })

    const goalId = goalCreated.body.goal.id
    expect(goalCreated.body.goal.status).toBe('IN_PROGRESS')

    const response = await request(app.server)
      .patch(`/goals/${goalId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.statusCode).toEqual(200)

    const goal = await prisma.goal.findUnique({
      where: {
        id: goalId,
      },
    })

    expect(goal?.status).toBe('CANCELLED')
  })
})
