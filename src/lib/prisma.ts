import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { env } from '@/env'

const connectionString = process.env.DATABASE_URL!
const url = new URL(connectionString)
const schema = url.searchParams.get('schema') ?? 'public'

const pool = new Pool({
  connectionString,
  options: `-c search_path="${schema}"`,
})

const adapter = new PrismaPg(pool, { schema })

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'dev' ? ['query'] : [],
})
