import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'

describe('Update Goal (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a goal', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const goalCreated = await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Car',
        targetAmount: 100000,
        deadline: dayjs().add(6, 'month'),
      })

    const goalId = goalCreated.body.goal.id

    const response = await request(app.server)
      .patch(`/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Porsche Cayenne',
        targetAmount: 950000,
        deadline: dayjs().add(16, 'month'),
      })

    expect(response.statusCode).toEqual(204)

    const goal = await prisma.goal.findUnique({
      where: {
        id: goalId,
      },
    })

    expect(goal?.title).toBe('Buy a Porsche Cayenne')
    expect(Number(goal?.targetAmount)).toBe(950000)
  })
})
