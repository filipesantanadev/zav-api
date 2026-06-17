export const registerUserSchema = {
  tags: ['Users'],
  summary: 'Cadastrar usuário',
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', description: 'John Doe', default: 'John Doe' },
      email: {
        type: 'string',
        format: 'email',
        default: 'johndoe@example.com',
      },
      password: { type: 'string', minLength: 6, default: '123456' },
    },
  },
  response: {
    201: {
      description: 'Usuário cadastrado com sucesso',
    },
    409: {
      description: 'E-mail já cadastrado',
      type: 'object',
      properties: {
        message: { type: 'string', description: 'E-mail already exists.' },
      },
    },
  },
} as const

export const authenticateUserSchema = {
  tags: ['Users'],
  summary: 'Autenticar usuário',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        default: 'johndoe@example.com',
      },
      password: { type: 'string', default: '123456' },
    },
  },
  response: {
    200: {
      description: 'Autenticado com sucesso',
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
    400: {
      description: 'Dados inválidos',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    401: {
      description: 'Credenciais inválidas',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
} as const

export const getUserProfileSchema = {
  tags: ['Users'],
  summary: 'Perfil do usuário autenticado',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
} as const

export const updateUserProfileSchema = {
  tags: ['Users'],
  summary: 'Atualizar perfil do usuário autenticado',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    409: {
      description: 'E-mail já cadastrado',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
} as const

export const refreshTokenSchema = {
  tags: ['Users'],
  summary: 'Renovar token de acesso',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
    401: {
      description: 'Não autenticado',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}
