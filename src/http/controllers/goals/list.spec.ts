import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import dayjs from 'dayjs'

describe('List Goals (With Pagination) (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list a goals with pagination', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const goals = [
      {
        title: 'Buy a Car',
        targetAmount: 100000,
        currentAmount: 0,
        deadline: dayjs().add(12, 'month').toDate(),
      },
      {
        title: 'Emergency Fund',
        targetAmount: 30000,
        currentAmount: 5000,
        deadline: dayjs().add(8, 'month').toDate(),
      },
      {
        title: 'Trip to Japan',
        targetAmount: 25000,
        currentAmount: 3000,
        deadline: dayjs().add(18, 'month').toDate(),
      },
      {
        title: 'Buy a Gaming PC',
        targetAmount: 12000,
        currentAmount: 2500,
        deadline: dayjs().add(6, 'month').toDate(),
      },
      {
        title: 'New Smartphone',
        targetAmount: 5000,
        currentAmount: 1200,
        deadline: dayjs().add(4, 'month').toDate(),
      },
      {
        title: 'House Down Payment',
        targetAmount: 80000,
        currentAmount: 10000,
        deadline: dayjs().add(24, 'month').toDate(),
      },
      {
        title: 'Wedding Celebration',
        targetAmount: 35000,
        currentAmount: 8000,
        deadline: dayjs().add(10, 'month').toDate(),
      },
      {
        title: 'Invest in Stocks',
        targetAmount: 15000,
        currentAmount: 4000,
        deadline: dayjs().add(5, 'month').toDate(),
      },
      {
        title: 'Build Retirement Fund',
        targetAmount: 200000,
        currentAmount: 25000,
        deadline: dayjs().add(60, 'month').toDate(),
      },
      {
        title: 'Buy a Motorcycle',
        targetAmount: 30000,
        currentAmount: 6000,
        deadline: dayjs().add(9, 'month').toDate(),
      },
      {
        title: 'Home Office Setup',
        targetAmount: 7000,
        currentAmount: 1000,
        deadline: dayjs().add(3, 'month').toDate(),
      },
      {
        title: 'Master Degree',
        targetAmount: 40000,
        currentAmount: 2000,
        deadline: dayjs().add(30, 'month').toDate(),
      },
      {
        title: 'Buy a New TV',
        targetAmount: 4500,
        currentAmount: 500,
        deadline: dayjs().add(2, 'month').toDate(),
      },
      {
        title: 'Family Vacation',
        targetAmount: 18000,
        currentAmount: 3500,
        deadline: dayjs().add(7, 'month').toDate(),
      },
      {
        title: 'Open a Business',
        targetAmount: 100000,
        currentAmount: 12000,
        deadline: dayjs().add(36, 'month').toDate(),
      },
      {
        title: 'Buy a House',
        targetAmount: 350000,
        currentAmount: 30000,
        deadline: dayjs().add(72, 'month').toDate(),
      },
      {
        title: 'New Furniture',
        targetAmount: 15000,
        currentAmount: 2500,
        deadline: dayjs().add(5, 'month').toDate(),
      },
      {
        title: 'Learn English Abroad',
        targetAmount: 50000,
        currentAmount: 4000,
        deadline: dayjs().add(20, 'month').toDate(),
      },
      {
        title: 'MacBook Pro',
        targetAmount: 18000,
        currentAmount: 5000,
        deadline: dayjs().add(6, 'month').toDate(),
      },
      {
        title: 'Financial Freedom Fund',
        targetAmount: 1000000,
        currentAmount: 50000,
        deadline: dayjs().add(120, 'month').toDate(),
      },
    ]

    for (const goal of goals) {
      const createGoalResponse = await request(app.server)
        .post('/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: goal.title,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline.toISOString(),
        })

      expect(createGoalResponse.statusCode).toBe(201)
    }

    const response = await request(app.server)
      .get('/goals')
      .query({
        page: 1,
        perPage: 5,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.goals).toHaveLength(5)
    expect(response.body.total).toEqual(20)
    expect(response.body.page).toEqual(1)
    expect(response.body.perPage).toEqual(5)
    expect(response.body.totalPages).toEqual(4)
  })
})
