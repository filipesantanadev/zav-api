import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'

describe('Update Goal Progress (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a goal progress', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const goalCreated = await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Porsche Cayenne',
        targetAmount: 950000,
        deadline: dayjs().add(16, 'month'),
      })

    const goalId = goalCreated.body.goal.id
    expect(goalCreated.body.goal.status).toBe('IN_PROGRESS')

    const response = await request(app.server)
      .patch(`/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 950000,
      })

    expect(response.statusCode).toEqual(200)

    const goal = await prisma.goal.findUnique({
      where: {
        id: goalId,
      },
    })

    expect(goal?.title).toBe('Buy a Porsche Cayenne')
    expect(goal?.status).toBe('ACHIEVED')
    expect(Number(goal?.currentAmount)).toBe(950000)
  })
})
