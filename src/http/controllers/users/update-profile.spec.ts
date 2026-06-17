import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Update Profile (e2e)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    const auth = await createAndAuthenticateUser(app)
    token = auth.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update name', async () => {
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
    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newpassword123' })

    expect(response.statusCode).toEqual(200)
  })

  it('should not return passwordHash in the response', async () => {
    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Hash User' })

    expect(response.statusCode).toEqual(200)
    expect(response.body.user).not.toHaveProperty('passwordHash')
  })

  it('should not be able to update email to one already in use', async () => {
    await request(app.server).post('/users').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password0123',
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

  it('should return 400 when email format is invalid', async () => {
    const response = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'not-an-email' })

    expect(response.statusCode).toEqual(400)
  })
})
