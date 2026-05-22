import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'

describe('Create Goal (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a goal', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy a Car',
        targetAmount: 100000,
        currentAmount: 0,
        deadline: dayjs().add(12, 'month'),
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body.goal).toEqual(
      expect.objectContaining({
        title: 'Buy a Car',
      }),
    )
  })
})
