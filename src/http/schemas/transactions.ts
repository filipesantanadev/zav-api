export const createTransactionSchema = {
  tags: ['Transactions'],
  summary: 'Criar transação',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['title', 'amount', 'type', 'date'],
    properties: {
      title: { type: 'string', description: 'Salário', default: 'Salário' },
      amount: { type: 'number', default: 10000 },
      type: { type: 'string', enum: ['INCOME', 'EXPENSE'], default: 'INCOME' },
      date: { type: 'string', format: 'date' },
      notes: { type: 'string', nullable: true },
      categoryId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        default: null,
      },
    },
  },
  response: {
    201: {
      description: 'Transação criada',
      type: 'object',
      properties: {
        transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            date: { type: 'string', format: 'date-time' },
            notes: { type: 'string', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    400: {
      description: 'Dados inválidos',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
} as const

export const fetchTransactionsSchema = {
  tags: ['Transactions'],
  summary: 'Listar transações com filtros e paginação',
  security: [{ bearerAuth: [] }],

  querystring: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
      categoryId: { type: 'string', format: 'uuid' },
      search: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      page: { type: 'integer', default: 1 },
      perPage: { type: 'integer', default: 20 },
    },
  },

  response: {
    200: {
      type: 'object',

      properties: {
        transactions: {
          type: 'array',

          items: {
            type: 'object',

            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              amount: { type: 'number' },
              type: {
                type: 'string',
                enum: ['INCOME', 'EXPENSE'],
              },
              notes: { type: 'string' },
              date: { type: 'string', format: 'date-time' },

              categoryId: {
                type: 'string',
                format: 'uuid',
              },

              userId: {
                type: 'string',
                format: 'uuid',
              },

              createdAt: {
                type: 'string',
                format: 'date-time',
              },

              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },

        total: { type: 'integer' },
        page: { type: 'integer' },
        perPage: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  },
} as const

export const updateTransactionSchema = {
  tags: ['Transactions'],
  summary: 'Atualizar transação',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: { type: 'null' },
    404: {
      description: 'Transação não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
} as const

export const deleteTransactionSchema = {
  tags: ['Transactions'],
  summary: 'Deletar transação',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    204: { description: 'Transação deletada', type: 'null' },
    404: {
      description: 'Transação não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
} as const
