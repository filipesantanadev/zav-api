import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'

describe('Search Transactions (With Filter, Pagination) (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search a transactions with filters and pagination', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const transactions = [
      {
        title: 'Salary',
        amount: 8500,
        type: 'INCOME',
        date: dayjs().subtract(2, 'day').toDate(),
      },
      {
        title: 'Freelance Website',
        amount: 3200,
        type: 'INCOME',
        date: dayjs().subtract(5, 'day').toDate(),
      },
      {
        title: 'Bonus',
        amount: 5000,
        type: 'INCOME',
        date: dayjs().subtract(10, 'day').toDate(),
      },
      {
        title: 'PLR',
        amount: 2500,
        type: 'INCOME',
        date: dayjs().subtract(15, 'day').toDate(),
      },
      {
        title: 'Dividend Income',
        amount: 1200,
        type: 'INCOME',
        date: dayjs().subtract(1, 'month').toDate(),
      },
      {
        title: 'Rent',
        amount: 1800,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'month').add(2, 'day').toDate(),
      },
      {
        title: 'Electricity Bill',
        amount: 220,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'month').add(5, 'day').toDate(),
      },
      {
        title: 'Internet',
        amount: 120,
        type: 'EXPENSE',
        date: dayjs().subtract(2, 'month').toDate(),
      },
      {
        title: 'Water Bill',
        amount: 90,
        type: 'EXPENSE',
        date: dayjs().subtract(2, 'month').add(4, 'day').toDate(),
      },
      {
        title: 'Groceries',
        amount: 650,
        type: 'EXPENSE',
        date: dayjs().subtract(3, 'month').toDate(),
      },
      {
        title: 'Gasoline',
        amount: 300,
        type: 'EXPENSE',
        date: dayjs().subtract(3, 'month').add(8, 'day').toDate(),
      },
      {
        title: 'Uber',
        amount: 70,
        type: 'EXPENSE',
        date: dayjs().subtract(4, 'month').toDate(),
      },
      {
        title: 'Gym Membership',
        amount: 120,
        type: 'EXPENSE',
        date: dayjs().subtract(5, 'month').toDate(),
      },
      {
        title: 'Netflix Subscription',
        amount: 39,
        type: 'EXPENSE',
        date: dayjs().subtract(6, 'month').toDate(),
      },
      {
        title: 'Spotify Premium',
        amount: 22,
        type: 'EXPENSE',
        date: dayjs().subtract(7, 'month').toDate(),
      },
      {
        title: 'Lunch',
        amount: 35,
        type: 'EXPENSE',
        date: dayjs().subtract(8, 'month').toDate(),
      },
      {
        title: 'Dinner',
        amount: 60,
        type: 'EXPENSE',
        date: dayjs().subtract(9, 'month').toDate(),
      },
      {
        title: 'Coffee',
        amount: 12,
        type: 'EXPENSE',
        date: dayjs().subtract(10, 'month').toDate(),
      },
      {
        title: 'New Headphones',
        amount: 350,
        type: 'EXPENSE',
        date: dayjs().subtract(11, 'month').toDate(),
      },
      {
        title: 'Gaming Mouse',
        amount: 250,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'year').toDate(),
      },
      {
        title: 'Book Purchase',
        amount: 80,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'year').subtract(1, 'month').toDate(),
      },
      {
        title: 'Medicine',
        amount: 150,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'year').subtract(2, 'month').toDate(),
      },
      {
        title: 'Doctor Appointment',
        amount: 300,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'year').subtract(3, 'month').toDate(),
      },
      {
        title: 'Travel Ticket',
        amount: 1200,
        type: 'EXPENSE',
        date: dayjs().subtract(1, 'year').subtract(4, 'month').toDate(),
      },
      {
        title: 'Hotel Reservation',
        amount: 1800,
        type: 'EXPENSE',
        date: dayjs().subtract(2, 'year').toDate(),
      },
      {
        title: 'Savings Deposit',
        amount: 1000,
        type: 'INCOME',
        date: dayjs().subtract(2, 'year').add(15, 'day').toDate(),
      },
      {
        title: 'Tax Refund',
        amount: 2200,
        type: 'INCOME',
        date: dayjs().subtract(2, 'year').add(1, 'month').toDate(),
      },
      {
        title: 'Cloud Hosting',
        amount: 100,
        type: 'EXPENSE',
        date: dayjs().subtract(2, 'year').add(3, 'month').toDate(),
      },
    ]

    for (const transaction of transactions) {
      const createdTransaction = await request(app.server)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
        })

      expect(createdTransaction.statusCode).toBe(201)
    }

    const response = await request(app.server)
      .get('/transactions')
      .query({
        startDate: dayjs().subtract(2, 'year').toISOString(),
        endDate: dayjs().toISOString(),
        type: 'EXPENSE',
        perPage: 40,
        page: 1,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.transactions).toHaveLength(20)
    expect(response.body.total).toEqual(20)
    expect(response.body.page).toEqual(1)
    expect(response.body.perPage).toEqual(40)
    expect(response.body.totalPages).toEqual(1)
  })
})
