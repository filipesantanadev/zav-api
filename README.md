# 💰 ZAV Finances API

> API para controle financeiro pessoal — gerencie receitas, despesas, categorias e metas financeiras com segurança e performance.

![Status](https://img.shields.io/badge/status-em%20produção-brightgreen)
![Node](https://img.shields.io/badge/node-v22-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-6.x-blue)
![License](https://img.shields.io/badge/license-ISC-lightgrey)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/filipesantanadev/zav-api/main/coverage-badge.json)](https://github.com/filipesantanadev/zav-api/blob/main/coverage-badge.json)
[![Deploy](https://img.shields.io/badge/deploy-Render-46E3B7?logo=render)](https://zav-api.onrender.com)
[![Swagger](https://img.shields.io/badge/docs-Swagger-85EA2D?logo=swagger)](https://zav-api.onrender.com/docs)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Deploy](#-deploy)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Scripts](#-scripts)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints](#-endpoints)
- [Fluxo](#-fluxo)
- [Testes](#-testes)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Roadmap](#-roadmap)
- [Autor](#-autor)
- [Licença](#-licença)

---

## 📌 Sobre o Projeto

O **ZAV Finances** é uma API de controle financeiro pessoal desenvolvida com foco em **arquitetura limpa**, **manutenibilidade**, **escalabilidade** e **testes automatizados**. A aplicação foi estruturada para manter uma separação clara entre as responsabilidades do sistema, isolando as **regras de negócio** das implementações externas, tornando o código mais **organizado**, **testável** e **fácil de evoluir**.

---

## ✅ Funcionalidades

- 🔐 Autenticação com JWT (10 min) e refresh token (7 dias) via cookie HttpOnly
- 💸 Controle de receitas e despesas com filtros avançados
- 🏷️ Categorias personalizadas (nome, cor hex e ícone) por usuário
- 🎯 Metas financeiras com acompanhamento de progresso automático
- 📊 Dashboard com resumo mensal, balanço dos últimos 6 meses e gastos por categoria
- 🔍 Listagem com filtros por tipo, categoria, período, título e paginação
- 🗃️ Histórico de transações preservado mesmo ao deletar categorias
- ⚡ Cache Redis no dashboard com TTL de 5 minutos e invalidação automática
- 📋 Logs estruturados em JSON via Pino (pino-pretty no desenvolvimento)
- 📝 Documentação interativa via Swagger em `/docs`
- 🩺 Health check em `/health` com status de banco e cache em tempo real

---

## 🛠️ Tecnologias

| Camada          | Tecnologia                   |
| --------------- | ---------------------------- |
| Runtime         | Node.js v22                  |
| Linguagem       | TypeScript 6.x               |
| Framework HTTP  | Fastify 5.x                  |
| ORM             | Prisma 7.x                   |
| Banco de Dados  | PostgreSQL 16                |
| Cache           | Redis 7                      |
| Validação       | Zod 4.x                      |
| Logs            | Pino (embutido no Fastify)   |
| Testes          | Vitest 4.x                   |
| Autenticação    | JWT (`@fastify/jwt`)         |
| Containerização | Docker + Docker Compose      |
| Documentação    | Swagger (`@fastify/swagger`) |
| CI/CD           | GitHub Actions               |

---

## 🏗️ Arquitetura

O projeto aplica princípios de Clean Architecture, separando responsabilidades entre entrada da aplicação, regras de negócio, abstrações e infraestrutura:

```
http/         → Interface de entrada da aplicação
use-cases/    → Casos de uso e regras de negócio
repositories/ → Contratos e implementações de persistência
infra/        → Serviços externos e integrações (Redis)
lib/          → Configuração e compartilhamento de dependências
```

### Diagrama da Arquitetura

```mermaid
flowchart TD
    A[Cliente Web/Mobile]
    A --> B[Fastify API]
    B --> C[Controllers]
    C --> D[Use Cases]
    D --> E[Repositories]
    D --> F[Redis Cache]
    E --> G[Prisma]
    G --> H[PostgreSQL]
```

Essa abordagem permite testar as regras de negócio de forma isolada usando **repositórios in-memory**, sem depender de banco de dados real.

---

## 🚀 Deploy

A API está em produção no **Render**, com PostgreSQL e Redis provisionados na mesma plataforma.

| Recurso | URL |
|---|---|
| API | https://zav-api.onrender.com |
| Documentação Swagger | https://zav-api.onrender.com/docs |
| Health Check | https://zav-api.onrender.com/health |

> O plano gratuito do Render pode apresentar cold start de alguns segundos na primeira requisição após período de inatividade.

---

## 📦 Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22
- [Docker](https://www.docker.com/) e Docker Compose
- [npm](https://www.npmjs.com/)

---

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/filipesantanadev/zav-api.git
cd zav-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Suba o banco de dados e o Redis
docker compose up -d

# Gere o Prisma Client
npx prisma generate

# Execute as migrations
npx prisma migrate dev

# Configure o ambiente de testes E2E (apenas uma vez por máquina)
npm run pretest:e2e

# Inicie o servidor em modo desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3333`  
Documentação Swagger: `http://localhost:3333/docs`

Para testar sem rodar localmente, use o ambiente de produção:
`https://zav-api.onrender.com/docs`

---

## 📜 Scripts

```bash
npm run start:dev      # Desenvolvimento com hot-reload (tsx watch)
npm run build          # Build de produção (tsup → build/)
npm run start          # Executa o build de produção
npm run test           # Testes unitários
npm run test:watch     # Testes unitários em modo watch
npm run test:e2e       # Testes end-to-end
npm run test:e2e:watch # Testes e2e em modo watch
npm run test:coverage  # Relatório de cobertura
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz com base em `.env.example`:

```env
NODE_ENV=development
APP_URL=http://localhost:3333
PORT=3333

# CORS — origens do frontend separadas por vírgula
CORS_ORIGIN=http://localhost:5173

# Auth
JWT_SECRET=seu-secret-aqui

# Banco de Dados
DATABASE_URL="postgresql://docker:docker@localhost:5432/apizav?schema=public"

# Redis (opcional em desenvolvimento — a API usa lazyConnect)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

> `REDIS_HOST` é opcional em desenvolvimento (a API usa `lazyConnect`). Em produção deve ser definido.  
> `CORS_ORIGIN` aceita múltiplas origens separadas por vírgula: `http://localhost:5173,https://meuapp.com`.

---

## 📡 Endpoints

### Autenticação

| Método  | Rota             | Descrição                         |
| ------- | ---------------- | --------------------------------- |
| `POST`  | `/users`         | Cadastro de usuário               |
| `POST`  | `/sessions`      | Login (retorna JWT)               |
| `PATCH` | `/token/refresh` | Renova o JWT via refresh token    |
| `GET`   | `/me`            | Perfil do usuário autenticado     |
| `PATCH` | `/me`            | Atualiza dados do perfil          |

### Transações

| Método   | Rota                | Descrição                      |
| -------- | ------------------- | ------------------------------ |
| `POST`   | `/transactions`     | Criar transação                |
| `GET`    | `/transactions`     | Listar com filtros e paginação |
| `PATCH`  | `/transactions/:id` | Atualizar transação            |
| `DELETE` | `/transactions/:id` | Deletar transação              |

> Filtros disponíveis: `type`, `categoryId`, `startDate`, `endDate`, `page`, `perPage`, `search`

### Categorias

| Método   | Rota              | Descrição         |
| -------- | ----------------- | ----------------- |
| `POST`   | `/categories`     | Criar categoria   |
| `GET`    | `/categories`     | Listar categorias |
| `DELETE` | `/categories/:id` | Deletar categoria |

### Metas

| Método   | Rota                  | Descrição               |
| -------- | --------------------- | ----------------------- |
| `GET`    | `/goals`              | Listar metas            |
| `POST`   | `/goals`              | Criar meta              |
| `PATCH`  | `/goals/:id`          | Atualizar dados da meta |
| `DELETE` | `/goals/:id`          | Deletar meta            |
| `PATCH`  | `/goals/:id/progress` | Atualizar progresso     |
| `PATCH`  | `/goals/:id/cancel`   | Cancelar meta           |

### Dashboard

| Método | Rota         | Descrição                  |
| ------ | ------------ | -------------------------- |
| `GET`  | `/dashboard` | Resumo financeiro completo |

### Health Check

| Método | Rota      | Auth | Descrição                              |
| ------ | --------- | ---- | -------------------------------------- |
| `GET`  | `/health` | Não  | Status da API e dos serviços de infra  |

**Exemplo de resposta — tudo operacional (`200`):**

```json
{
  "status": "UP",
  "timestamp": "2026-06-21T00:00:00.000Z",
  "services": {
    "database": { "status": "UP" },
    "cache":    { "status": "UP" }
  }
}
```

**Exemplo de resposta — serviço indisponível (`503`):**

```json
{
  "status": "DOWN",
  "timestamp": "2026-06-21T00:00:00.000Z",
  "services": {
    "database": { "status": "UP" },
    "cache":    { "status": "DOWN", "error": "Connection refused" }
  }
}
```

> Rate limit: 30 requisições por minuto. Endpoint público, sem autenticação.

### Documentação

A documentação interativa da API está disponível em `http://localhost:3333/docs` após iniciar o servidor.

---

## 📈 Fluxo

```mermaid
flowchart TD
    A[POST /transactions]
    A --> B[TransactionController]
    B --> C[CreateTransactionUseCase]
    C --> D[TransactionsRepository]
    D --> E[Prisma]
    E --> F[PostgreSQL]
    F --> G[Response]
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes e2e
npm run test:e2e
```

Os testes unitários usam **repositórios in-memory** que implementam as mesmas interfaces do banco real, garantindo velocidade e isolamento total.

Os testes e2e criam um schema PostgreSQL isolado por suite (via `vitest-environment-prisma`) e rodam migrations completas antes de cada execução.

### Cobertura de testes

O relatório de cobertura é gerado com `npm run test:coverage` e mede exclusivamente a lógica de negócio (`src/use-cases/`), excluindo factories e utilitários de teste. O threshold mínimo exigido é **80%** em statements, branches, functions e lines.

| Métrica    | Cobertura |
| ---------- | --------- |
| Statements | 100%      |
| Branches   | 100%      |
| Functions  | 100%      |
| Lines      | 100%      |

O relatório HTML completo é gerado localmente em `coverage/index.html` com `npm run test:coverage`. O badge acima é actualizado automaticamente pelo CI a cada push para `main`, sem dependência de serviços externos.

### Auditoria de dependências

```bash
npm audit
```

O `npm audit` reporta vulnerabilidades exclusivamente em **dependências de desenvolvimento** (ferramentas de build e lint). Nenhuma dependência de runtime é afetada:

| Pacote vulnerável | Origem | Categoria |
|---|---|---|
| `minimatch` | `@rocketseat/eslint-config` | ESLint (não vai a produção) |
| `esbuild` | `tsup` | Bundler de build (não vai a produção) |
| `@hono/node-server` | `prisma` CLI | CLI de migrations (não vai a produção) |

Os fixes disponíveis exigem breaking changes (downgrade do Prisma ou troca do preset do ESLint), portanto foram mantidos intencionalmente. As dependências de runtime — `fastify`, `@prisma/client`, `ioredis`, `zod`, `bcryptjs` — estão todas sem vulnerabilidades conhecidas.

---

## 📁 Estrutura de Pastas

```
src/
├── @types/                     # Extensões de tipagem TypeScript
│   └── fastify-jwt.d.ts        # Tipagem customizada do JWT no Fastify
│
├── env/                        # Validação e carregamento de variáveis de ambiente
│   └── index.ts
│
├── http/                       # Camada HTTP (rotas, controllers e middlewares)
│   ├── controllers/
│   │   ├── categories/         # Endpoints de categorias
│   │   ├── dashboards/         # Endpoints do dashboard
│   │   ├── goals/              # Endpoints de metas
│   │   ├── health/             # Endpoint de health check
│   │   ├── transactions/       # Endpoints de transações
│   │   └── users/              # Endpoints de usuários/autenticação
│   │
│   ├── middlewares/            # Middlewares do Fastify
│   │   └── verify-jwt.ts
│   │
│   ├── plugins/                # Plugins do Fastify
│   │   └── swagger.ts          # Configuração do Swagger/OpenAPI
│   │
│   ├── presenters/             # Transformação/formatação de respostas
│   │   └── goal-presenter.ts
│   │
│   └── schemas/                # Schemas de documentação OpenAPI por domínio
│       ├── categories.ts
│       ├── dashboard.ts
│       ├── goals.ts
│       ├── health.ts
│       ├── transactions.ts
│       └── users.ts
│
├── infra/                      # Serviços externos e infraestrutura
│   └── cache/
│       ├── cache.service.ts    # Contrato do cache
│       └── redis.service.ts    # Implementação Redis
│
├── lib/                        # Configuração e instâncias compartilhadas
│   ├── logger.ts               # Configuração do Pino por ambiente
│   └── prisma.ts               # Instância do Prisma Client
│
├── repositories/               # Contratos e implementações dos repositórios
│   ├── prisma/                 # Implementações reais utilizando Prisma
│   ├── in-memory/              # Repositórios em memória para testes
│   ├── categories-repository.ts
│   ├── goals-repository.ts
│   ├── transactions-repository.ts
│   └── users-repository.ts
│
├── use-cases/                  # Regras de negócio da aplicação
│   ├── categories/             # Casos de uso de categorias
│   ├── goals/                  # Casos de uso de metas
│   ├── transactions/           # Casos de uso de transações
│   ├── users/                  # Casos de uso de usuários
│   │
│   ├── errors/                 # Exceções e erros customizados
│   │
│   └── factories/              # Injeção manual de dependências
│       ├── categories/
│       ├── goals/
│       ├── transactions/
│       └── users/
│
├── utils/                      # Funções auxiliares
│   └── test/                   # Helpers utilitários para testes
│
├── app.ts                      # Configuração principal do Fastify
└── server.ts                   # Inicialização do servidor
```

---

## 🗺️ Roadmap

- [x] Setup inicial (Fastify + Prisma + PostgreSQL)
- [x] Schema do banco de dados
- [x] Autenticação com JWT + refresh token via cookie HttpOnly
- [x] CRUD de categorias
- [x] CRUD de transações com filtros avançados e paginação
- [x] Metas financeiras com progresso automático
- [x] Dashboard consolidado com cache Redis
- [x] Testes unitários (use cases com repositórios in-memory)
- [x] Testes e2e (controllers via supertest + schema isolado)
- [x] Documentação com Swagger
- [x] CI/CD com GitHub Actions
- [x] Logs estruturados em JSON via Pino
- [x] Rate limiting (`@fastify/rate-limit`)
- [x] CORS configurável por ambiente
- [x] Deploy em produção (Render — PostgreSQL + Redis)
- [x] Health check endpoint (`GET /health`) com status de banco e cache

### Próximos passos

- [ ] Monitoramento e métricas com Sentry

---

## 👨‍💻 Autor

**Filipe Santana**

[![GitHub](https://img.shields.io/badge/GitHub-filipesantanadev-181717?logo=github)](https://github.com/filipesantanadev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Filipe%20Santana-0A66C2?logo=linkedin)](https://www.linkedin.com/in/filipe-de-souza-santana-409b351a2/)

---

## 📄 Licença

Este projeto está sob a licença ISC.
