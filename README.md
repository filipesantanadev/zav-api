# 💰 ZAV Finances API

> API para controle financeiro pessoal — gerencie receitas, despesas, categorias e metas financeiras com segurança e performance.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/node-v22-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## 📋 Índice

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Tecnologias Planejadas](#-tecnologias-planejadas)
- [Arquitetura](#-arquitetura)
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

- 🔐 Autenticação com JWT e refresh token
- 💸 Controle de receitas e despesas
- 🏷️ Categorias personalizadas por usuário
- 🎯 Metas financeiras com acompanhamento de progresso
- 📊 Dashboard com resumo mensal e gastos por categoria
- 🔍 Listagem com filtros avançados e paginação
- 🗃️ Histórico de transações preservado mesmo ao deletar categorias

---

## 🛠️ Tecnologias

| Camada          | Tecnologia              |
| --------------- | ----------------------- |
| Runtime         | Node.js v22             |
| Linguagem       | TypeScript              |
| Framework HTTP  | Fastify                 |
| ORM             | Prisma                  |
| Banco de Dados  | PostgreSQL 16           |
| Cache           | Redis 7                 |
| Validação       | Zod                     |
| Testes          | Vitest                  |
| Autenticação    | JWT                     |
| Containerização | Docker + Docker Compose |

---

## 🚀 Tecnologias Planejadas

| Categoria     | Tecnologia                   |
| ------------- | ---------------------------- |
| Logs          | Pino                         |
| Documentação  | Swagger (`@fastify/swagger`) |
| Monitoramento | Prometheus + Grafana         |

---

## 🏗️ Arquitetura

O projeto aplica princípios de Clean Architecture, separando responsabilidades entre entrada da aplicação, regras de negócio, abstrações e infraestrutura:

```
http/         → Interface de entrada da aplicação
use-cases/    → Casos de uso e regras de negócio
repositories/ → Contratos e implementações de persistência
infra/        → Serviços externos e integrações
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

## 📦 Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22
- [Docker](https://www.docker.com/) e Docker Compose
- [npm](https://www.npmjs.com/)

---

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/filipesantanadev/zap-api.git
cd zav-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Suba o banco de dados e o Redis
docker compose up -d

# Execute as migrations
npx prisma migrate dev

# Inicie o servidor em modo desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3333`

---

## 📜 Scripts

```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build da aplicação
npm run start          # Produção
npm run test           # Testes unitários
npm run test:e2e       # Testes end-to-end
npm run test:coverage  # Coverage
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

Consulte `.env.example` para todas as variáveis disponíveis.

```env
# Servidor
PORT=3333
NODE_ENV=development

# Banco de Dados
DATABASE_URL="postgresql://finance:finance@localhost:5432/finance_db"

# JWT
JWT_SECRET="seu-secret-aqui"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
```

---

## 📡 Endpoints

### Autenticação

| Método  | Rota             | Descrição                     |
| ------- | ---------------- | ----------------------------- |
| `POST`  | `/users`         | Cadastro de usuário           |
| `POST`  | `/sessions`      | Login (retorna JWT)           |
| `PATCH` | `/token/refresh` | Refresh token                 |
| `GET`   | `/me`            | Perfil do usuário autenticado |

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

> 🚧 A documentação interativa via Swagger será disponibilizada após implementação.

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
│   │   ├── transactions/       # Endpoints de transações
│   │   └── users/              # Endpoints de usuários/autenticação
│   │
│   ├── middlewares/            # Middlewares do Fastify
│   │   └── verify-jwt.ts
│   │
│   └── presenters/             # Transformação/formatação de respostas
│       └── goal-presenter.ts
│
├── infra/                      # Serviços externos e infraestrutura
│   └── cache/
│       ├── cache.service.ts    # Contrato do cache
│       └── redis.service.ts    # Implementação Redis
│
├── lib/                        # Configuração e instâncias compartilhadas
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
- [x] Autenticação com JWT
- [x] CRUD de categorias
- [x] CRUD de transações com filtros
- [x] Metas financeiras
- [x] Dashboard consolidado
- [x] Cache com Redis
- [x] Testes unitários e e2e

### Próximos passos

- [ ] Documentação com Swagger
- [ ] Logs estruturados com Pino
- [ ] Monitoramento e métricas com Prometheus + Grafana
- [ ] Deploy

---

## 👨‍💻 Autor

**Filipe Santana**

[![GitHub](https://img.shields.io/badge/GitHub-filipesantanadev-181717?logo=github)](https://github.com/filipesantanadev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Filipe%20Santana-0A66C2?logo=linkedin)](https://www.linkedin.com/in/filipe-de-souza-santana-409b351a2/)

---

## 📄 Licença

Este projeto está sob a licença ISC.
