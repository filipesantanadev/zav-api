import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'

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
})
