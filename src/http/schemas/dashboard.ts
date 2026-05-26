export const getDashboardSchema = {
  tags: ['Dashboard'],
  summary: 'Obter dashboard financeiro',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      month: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        default: new Date().getMonth() + 1,
      },
      year: { type: 'integer', default: new Date().getFullYear() },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalIncome: { type: 'number' },
            totalExpense: { type: 'number' },
            balance: { type: 'number' },
            month: { type: 'integer' },
            year: { type: 'integer' },
          },
        },
        goals: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  targetAmount: { type: 'number' },
                  currentAmount: { type: 'number' },
                  deadline: { type: 'string', format: 'date-time' },
                  status: {
                    type: 'string',
                    enum: ['IN_PROGRESS', 'ACHIEVED', 'CANCELLED'],
                  },
                },
              },
            },
            total: { type: 'integer' },
          },
        },
        expensesByCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              categoryId: { type: 'string', format: 'uuid', nullable: true },
              categoryName: { type: 'string', nullable: true },
              total: { type: 'number' },
              percentage: { type: 'integer' },
            },
          },
        },
        last6Months: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'integer' },
              year: { type: 'integer' },
              totalIncome: { type: 'number' },
              totalExpense: { type: 'number' },
              balance: { type: 'number' },
            },
          },
        },
      },
    },
    401: {
      description: 'Não autenticado',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}
