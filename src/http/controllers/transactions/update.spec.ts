import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'

describe('Update Transaction (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a transaction', async () => {
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
      .patch(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary FullStack Senior',
        amount: 11000,
      })

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(transaction?.title).toBe('Salary FullStack Senior')
    expect(Number(transaction?.amount)).toBe(11000)
  })

  it('should not be able to update a transaction without a token', async () => {
    const response = await request(app.server)
      .patch('/transactions/00000000-0000-0000-0000-000000000000')
      .send({ title: 'Attempt' })

    expect(response.statusCode).toEqual(401)
  })

  it('should not be able to update another user transaction', async () => {
    const { token: tokenOwner } = await createAndAuthenticateUser(
      app,
      'owner@example.com',
    )
    const { token: tokenOther } = await createAndAuthenticateUser(
      app,
      'other@example.com',
    )

    const transactionCreated = await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        title: 'Salary DEV Full-Stack',
        amount: 8500,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
      })

    const transactionId = transactionCreated.body.transaction.id

    const response = await request(app.server)
      .patch(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${tokenOther}`)
      .send({ title: 'Hijacked' })

    expect(response.statusCode).toEqual(404)
  })
})
