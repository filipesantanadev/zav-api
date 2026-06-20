import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'

describe('Get Dashboard (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should reflect updated data after creating a transaction (cache invalidation)', async () => {
    const { token } = await createAndAuthenticateUser(app, 'cache-create@example.com')

    const firstDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(firstDashboard.statusCode).toEqual(200)
    expect(firstDashboard.body.summary.totalIncome).toEqual(0)

    await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Income',
        amount: 3000,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
      })

    const secondDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(secondDashboard.statusCode).toEqual(200)
    expect(secondDashboard.body.summary.totalIncome).toEqual(3000)
  })

  it('should reflect updated data after updating a transaction (cache invalidation)', async () => {
    const { token } = await createAndAuthenticateUser(app, 'cache-update@example.com')

    const created = await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary',
        amount: 5000,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
      })

    const transactionId = created.body.transaction.id

    const firstDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(firstDashboard.statusCode).toEqual(200)
    expect(firstDashboard.body.summary.totalIncome).toEqual(5000)

    await request(app.server)
      .patch(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 8000 })

    const secondDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(secondDashboard.statusCode).toEqual(200)
    expect(secondDashboard.body.summary.totalIncome).toEqual(8000)
  })

  it('should reflect updated data after deleting a transaction (cache invalidation)', async () => {
    const { token } = await createAndAuthenticateUser(app, 'cache-delete@example.com')

    const created = await request(app.server)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salary',
        amount: 5000,
        type: 'INCOME',
        date: new Date().toISOString().split('T')[0],
      })

    const transactionId = created.body.transaction.id

    const firstDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(firstDashboard.statusCode).toEqual(200)
    expect(firstDashboard.body.summary.totalIncome).toEqual(5000)

    await request(app.server)
      .delete(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)

    const secondDashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(secondDashboard.statusCode).toEqual(200)
    expect(secondDashboard.body.summary.totalIncome).toEqual(0)
  })

  it('should not be able to get dashboard without a token', async () => {
    const response = await request(app.server).get('/dashboard')

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({ message: 'Unauthorized.' })
  })

  it('should be able to get dashboard', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const transactions = [
      {
        title: 'Salary',
        amount: 8500,
        type: 'INCOME',
        date: dayjs().subtract(1, 'day').toDate(),
      },
      {
        title: 'Water Bills',
        amount: 150,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'day').toDate(),
      },
      {
        title: 'Buy a Professional Biker',
        amount: 950,
        type: 'EXPENSE',
        date: dayjs().subtract(10, 'day').toDate(),
      },
      {
        title: 'Salary',
        amount: 8500,
        type: 'INCOME',
        date: dayjs().subtract(1, 'month').toDate(),
      },
      {
        title: 'Freelance Website',
        amount: 3200,
        type: 'INCOME',
        date: dayjs().subtract(2, 'month').toDate(),
      },
      {
        title: 'Rent',
        amount: 1800,
        type: 'EXPENSE',
        date: dayjs().subtract(3, 'month').toDate(),
      },
      {
        title: 'Electricity Bill',
        amount: 220,
        type: 'EXPENSE',
        date: dayjs().subtract(4, 'month').toDate(),
      },
      {
        title: 'Electricity Bill',
        amount: 220,
        type: 'EXPENSE',
        date: dayjs().subtract(5, 'month').toDate(),
      },
      {
        title: 'Buy a Guitar',
        amount: 5000,
        type: 'EXPENSE',
        date: dayjs().subtract(6, 'month').toDate(),
      },
      {
        title: 'Water Bill',
        amount: 350,
        type: 'EXPENSE',
        date: dayjs().subtract(7, 'month').toDate(),
      },
    ]

    for (const transaction of transactions) {
      const response = await request(app.server)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date.toISOString().split('T')[0],
        })

      expect(response.statusCode).toBe(201)
    }

    const dashboard = await request(app.server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(dashboard.statusCode).toEqual(200)
    expect(dashboard.body).toHaveProperty('summary')
    expect(dashboard.body).toHaveProperty('goals')
    expect(dashboard.body).toHaveProperty('expensesByCategory')
    expect(dashboard.body).toHaveProperty('last6Months')
    expect(dashboard.body.summary.totalIncome).toEqual(8500)
    expect(dashboard.body.summary.totalExpense).toEqual(1100)
    expect(dashboard.body.summary.balance).toEqual(7400)
    expect(dashboard.body.last6Months).toHaveLength(6)
  })
})
