import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

describe('Delete Category (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete a Category', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const categoryCreated = await request(app.server)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Salary',
        color: '#0053b3',
        icon: 'wallet',
      })

    const categoryId = categoryCreated.body.category.id

    const response = await request(app.server)
      .delete(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    expect(response.statusCode).toEqual(204)
    expect(category).toBeNull()
  })

  it('should not be able to delete a category that has active goals', async () => {
    const { token } = await createAndAuthenticateUser(
      app,
      'active-goals@example.com',
    )

    const categoryCreated = await request(app.server)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Travel',
        color: '#0AF1B3',
        icon: 'plane',
      })

    const categoryId = categoryCreated.body.category.id

    await request(app.server)
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Trip to Japan',
        targetAmount: 5000,
        currentAmount: 0,
        deadline: dayjs().add(1, 'year').toISOString(),
        categoryId,
      })

    const response = await request(app.server)
      .delete(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual({
      message: 'Cannot delete a category that has active goals linked to it.',
    })
  })
})
