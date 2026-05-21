import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Search Transactions (With Filter, Pagination) (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search a transactions with filters and pagination', async () => {
    const { token } = await createAndAuthenticateUser(app)

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary DEV Full-Stack',
        amount: 8500,
        type: 'INCOME',
        date: new Date(),
      })

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary Freelance',
        amount: 3500,
        type: 'INCOME',
        date: new Date(),
      })

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Rent',
        amount: 500,
        type: 'INCOME',
        date: new Date(),
      })

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary PLR',
        amount: 4500,
        type: 'INCOME',
        date: new Date(),
      })

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Bills',
        amount: 1500,
        type: 'EXPENSE',
        date: new Date(),
      })

    for (let i = 1; i <= 200; i++) {
      await request(app.server)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `SALARY ${i}`,
          amount: 1500,
          type: 'EXPENSE',
          date: new Date(),
        })
    }

    const response = await request(app.server)
      .get('/transactions')
      .query({
        search: 'Salary',
        perPage: 40,
        page: 2,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.transactions).toHaveLength(40)
    expect(response.body.total).toEqual(203)
    expect(response.body.page).toEqual(2)
    expect(response.body.perPage).toEqual(40)
    expect(response.body.totalPages).toEqual(6)
  })
})
