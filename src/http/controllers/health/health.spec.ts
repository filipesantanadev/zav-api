import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Health Check (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get health status', async () => {
    const response = await request(app.server).get('/health')

    expect(response.statusCode).toEqual(200)
    expect(response.body.status).toEqual('UP')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body.services).toEqual({
      database: { status: 'UP' },
      cache: { status: 'UP' },
    })
  })

  // The 503/DOWN path requires stopping Docker services mid-test, which is
  // not feasible in the standard E2E environment. It is covered by manual
  // testing only.

  it('should return a valid ISO timestamp', async () => {
    const response = await request(app.server).get('/health')

    expect(response.statusCode).toEqual(200)
    expect(new Date(response.body.timestamp).toISOString()).toEqual(
      response.body.timestamp,
    )
  })
})
