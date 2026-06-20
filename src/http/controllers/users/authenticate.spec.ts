import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Authenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password0123',
    })

    const response = await request(app.server).post('/sessions').send({
      email: 'johndoe@example.com',
      password: 'password0123',
    })

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      token: expect.any(String),
    })
    const [cookie] = response.get('Set-Cookie')!
    expect(cookie).toContain('refreshToken=')
    expect(cookie).toContain('Max-Age=604800')
  })

  it('should not be able to authenticate with wrong password', async () => {
    await request(app.server).post('/users').send({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password: 'password0123',
    })

    const response = await request(app.server).post('/sessions').send({
      email: 'janedoe@example.com',
      password: 'wrong-password',
    })

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })

  it('should not be able to authenticate with wrong email', async () => {
    const response = await request(app.server).post('/sessions').send({
      email: 'nonexistent@example.com',
      password: 'password0123',
    })

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
