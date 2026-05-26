export const listCategoriesSchema = {
  tags: ['Categories'],
  summary: 'Listar categorias do usuário',
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
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              color: { type: 'string' },
              icon: { type: 'string' },
              userId: { type: 'string', format: 'uuid' },
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

export const createCategorySchema = {
  tags: ['Categories'],
  summary: 'Criar categoria',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'color', 'icon'],
    properties: {
      name: { type: 'string', default: 'Salary' },
      color: { type: 'string', default: '#10B981' },
      icon: { type: 'string', default: 'wallet' },
    },
  },
  response: {
    201: {
      description: 'Categoria criada',
      type: 'object',
      properties: {
        category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            color: { type: 'string' },
            icon: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    409: {
      description: 'Categoria já existe',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

export const deleteCategorySchema = {
  tags: ['Categories'],
  summary: 'Deletar categoria',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    204: { description: 'Categoria deletada', type: 'null' },
    404: {
      description: 'Categoria não encontrada',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}
