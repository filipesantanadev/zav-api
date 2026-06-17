import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Update Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update name', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Updated' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.user).toEqual(
      expect.objectContaining({ name: 'John Updated' }),
    )
  })

  it('should be able to update email', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'updated@example.com' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.user).toEqual(
      expect.objectContaining({ email: 'updated@example.com' }),
    )
  })

  it('should be able to update password', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newpassword123' })

    expect(response.statusCode).toEqual(200)
  })

  it('should not return passwordHash in the response', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Hash User' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.user).not.toHaveProperty('passwordHash')
  })

  it('should not be able to update email to one already in use', async () => {
    const { token } = await createAndAuthenticateUser(app)

    await request(app.server).post('/users').send({
      name: 'Other User',
      email: 'other@example.com',
      password: '123456',
    })

    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'other@example.com' })

    expect(response.statusCode).toEqual(409)
  })

  it('should not be able to update profile without a token', async () => {
    const response = await request(app.server)
      .patch('/me')
      .send({ name: 'No Token' })

    expect(response.statusCode).toEqual(401)
  })
})
