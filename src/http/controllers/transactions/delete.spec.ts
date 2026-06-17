import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'

describe('Delete Transaction (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete a transaction', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const transactionCreated = await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary DEV Full-Stack',
        amount: 8500,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
      })

    const transactionId = transactionCreated.body.transaction.id

    const response = await request(app.server)
      .delete(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    })

    expect(response.statusCode).toEqual(204)
    expect(transaction).toBeNull()
  })
})
