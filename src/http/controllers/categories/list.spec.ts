import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('List Categories (With Pagination) (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list a categories with pagination', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const categories = [
      { name: 'Salary', color: '#10B981', icon: 'wallet' },
      { name: 'Freelance', color: '#3B82F6', icon: 'briefcase' },
      { name: 'Food', color: '#EF4444', icon: 'utensils-crossed' },
      { name: 'Transport', color: '#F59E0B', icon: 'car' },
      { name: 'Housing', color: '#8B5CF6', icon: 'house' },
      { name: 'Health', color: '#EC4899', icon: 'heart-pulse' },
      { name: 'Bills', color: '#6B7280', icon: 'receipt' },
      { name: 'Entertainment', color: '#EAB308', icon: 'gamepad-2' },
      { name: 'Education', color: '#06B6D4', icon: 'graduation-cap' },
      { name: 'Shopping', color: '#F97316', icon: 'shopping-bag' },
      { name: 'Travel', color: '#0EA5E9', icon: 'plane' },
      { name: 'Gym', color: '#84CC16', icon: 'dumbbell' },
      { name: 'Investments', color: '#14B8A6', icon: 'chart-column' },
      { name: 'Pets', color: '#A855F7', icon: 'paw-print' },
      { name: 'Subscriptions', color: '#6366F1', icon: 'tv' },
      { name: 'Gift', color: '#E11D48', icon: 'gift' },
      { name: 'Savings', color: '#22C55E', icon: 'piggy-bank' },
      { name: 'Taxes', color: '#78716C', icon: 'badge-percent' },
      { name: 'Personal', color: '#D946EF', icon: 'user' },
      { name: 'Other', color: '#64748B', icon: 'circle-ellipsis' },
    ]

    for (const category of categories)
      await request(app.server)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `${category?.name}`,
          color: `${category?.color}`,
          icon: `${category?.icon}`,
        })

    const response = await request(app.server)
      .get('/categories')
      .query({
        page: 1,
        perPage: 5,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.categories).toHaveLength(5)
    expect(response.body.total).toEqual(20)
    expect(response.body.page).toEqual(1)
    expect(response.body.perPage).toEqual(5)
    expect(response.body.totalPages).toEqual(4)
  })
})
