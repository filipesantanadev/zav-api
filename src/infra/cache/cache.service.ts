import { redis } from './redis.service'

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    await redis.del(key)
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

export const cache = new CacheService()
