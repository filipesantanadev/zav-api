import dayjs from 'dayjs'

export const listGoalsSchema = {
  tags: ['Goals'],
  summary: 'Listar metas do usuário',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', default: 1 },
      perPage: { type: 'integer', default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        goals: {
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
              userId: { type: 'string', format: 'uuid' },
              categoryId: { type: 'string', format: 'uuid', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
}

export const createGoalSchema = {
  tags: ['Goals'],
  summary: 'Criar meta financeira',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['title', 'targetAmount', 'deadline'],
    properties: {
      title: { type: 'string', default: 'Reserva de emergência' },
      targetAmount: { type: 'number', default: 1000000 },
      deadline: {
        type: 'string',
        format: 'date-time',
        default: dayjs().add(1, 'month').toDate().toISOString(),
      },
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
      description: 'Meta criada',
      type: 'object',
      properties: {
        goal: {
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
}

export const updateGoalSchema = {
  tags: ['Goals'],
  summary: 'Atualizar meta financeira',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      targetAmount: { type: 'number' },
      deadline: { type: 'string', format: 'date-time' },
      categoryId: { type: 'string', format: 'uuid', nullable: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        goal: {
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
    },
    404: {
      description: 'Meta não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export const deleteGoalSchema = {
  tags: ['Goals'],
  summary: 'Deletar meta financeira',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    204: { description: 'Meta deletada', type: 'null' },
    404: {
      description: 'Meta não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export const updateGoalProgressSchema = {
  tags: ['Goals'],
  summary: 'Atualizar progresso da meta',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  body: {
    type: 'object',
    required: ['amount'],
    properties: {
      amount: { type: 'number', default: 50000 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            targetAmount: { type: 'number' },
            currentAmount: { type: 'number' },
            status: {
              type: 'string',
              enum: ['IN_PROGRESS', 'ACHIEVED', 'CANCELLED'],
            },
          },
        },
        percentage: { type: 'integer' },
      },
    },
    404: {
      description: 'Meta não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
    400: {
      description: 'Erro de validação',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export const cancelGoalSchema = {
  tags: ['Goals'],
  summary: 'Cancelar meta financeira',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            status: { type: 'string', enum: ['CANCELLED'] },
          },
        },
      },
    },
    404: {
      description: 'Meta não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
    400: {
      description: 'Meta já foi atingida ou cancelada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}
