const serviceStatusSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['UP', 'DOWN'] },
    error: { type: 'string' },
  },
} as const

const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['UP', 'DOWN'] },
    timestamp: { type: 'string', format: 'date-time' },
    services: {
      type: 'object',
      properties: {
        database: serviceStatusSchema,
        cache: serviceStatusSchema,
      },
    },
  },
} as const

export const getHealthSchema = {
  tags: ['Health'],
  summary: 'Verificar saúde da API',
  response: {
    200: {
      description: 'API e serviços operacionais',
      ...healthResponseSchema,
    },
    503: {
      description: 'Um ou mais serviços indisponíveis',
      ...healthResponseSchema,
    },
  },
} as const
