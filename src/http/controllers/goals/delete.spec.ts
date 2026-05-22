import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

describe('Delete Goal (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete a goal', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const goalCreated = await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Car',
        targetAmount: 100000,
        currentAmount: 0,
        deadline: dayjs().add(12, 'month').toDate(),
      })

    const goalId = goalCreated.body.goal.id

    const response = await request(app.server)
      .delete(`/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)

    const goal = await prisma.category.findUnique({
      where: {
        id: goalId,
      },
    })

    expect(response.statusCode).toEqual(204)
    expect(goal).toBeNull()
  })
})
