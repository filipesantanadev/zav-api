import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Create Transaction (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a transaction', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary DEV Full-Stack',
        amount: 8500,
        type: 'INCOME',
        date: new Date(),
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Salary DEV Full-Stack',
      }),
    )
  })
})
