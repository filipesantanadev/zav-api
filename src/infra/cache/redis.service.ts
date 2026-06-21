import { Redis } from 'ioredis'
import { env } from '@/env'
import { log } from '@/lib/logger'

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true,
  // Limits how long a TCP connection attempt waits before failing (default: 10 000 ms).
  connectTimeout: 3000,
  // Limits how long a command waits for a response once connected.
  // On Windows + Docker Desktop the TCP handshake succeeds even when the container
  // is stopped (the Docker proxy accepts the connection), so connectTimeout alone
  // is not enough — the PING would hang indefinitely without this.
  commandTimeout: 3000,
  // After 0 reconnection retries, queued commands are flushed with an error.
  maxRetriesPerRequest: 0,
})

// ioredis emits an 'error' event on connection loss. Without a listener, Node.js
// treats this as an uncaught exception and crashes the process.
// Per-command errors still surface as rejected promises, caught by callers.
redis.on('error', (err) => log.warn({ err }, 'Redis connection error'))
