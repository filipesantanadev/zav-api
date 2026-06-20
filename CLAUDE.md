# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev          # Start with hot-reload (tsx watch)
npm run build              # Compile with tsup → build/
npm run start              # Run compiled output

# Database
docker compose up -d       # Start PostgreSQL + Redis
npx prisma migrate dev     # Apply migrations (dev)
npx prisma migrate deploy  # Apply migrations (CI/prod)
npx prisma studio          # Visual database browser

# Testing
npm run test               # Unit tests (src/use-cases/**/*.spec.ts)
npm run test:watch         # Unit tests in watch mode
npm run test:e2e           # E2E tests (src/http/controllers/**/*.spec.ts)
npm run test:e2e:watch     # E2E tests in watch mode
npm run test:coverage      # Coverage report

# Setup E2E environment (run once per machine/clone)
npm run pretest:e2e        # Links vitest-environment-prisma
```

Run a single test file:
```bash
npx vitest run --config vite.config.ts src/use-cases/users/authenticate.spec.ts
npx vitest run --config vite.e2e.config.ts src/http/controllers/users/authenticate.spec.ts
```

Lint: `npx eslint src` — uses `@rocketseat/eslint-config/node` (no dedicated npm script).

## Architecture

Clean Architecture with manual dependency injection via factories. Dependency flow is strictly one-directional:

```
HTTP Controllers → Use Cases → Repository Interfaces ← Repository Implementations (Prisma / In-Memory)
                                      ↓
                               Cache (Redis via CacheService)
```

**Layers:**

- `src/http/controllers/` — Fastify route handlers. Each domain has a `routes.ts` that registers endpoints and attaches Swagger schemas from `src/http/schemas/`. Controllers call factory functions to get use case instances — never instantiate use cases or repositories directly.
- `src/use-cases/` — All business logic. Each use case is a class with a single `execute()` method. Throws domain-typed error classes from `src/use-cases/errors/`.
- `src/use-cases/factories/` — The only place that creates `new PrismaXxxRepository()`. Factory functions compose repositories and use cases.
- `src/repositories/` — TypeScript interfaces at the root; `prisma/` and `in-memory/` implementations beneath.
- `src/infra/cache/` — `CacheService` wraps ioredis. The exported `cache` singleton is used directly by use cases that need Redis.
- `src/http/schemas/` — Plain OpenAPI JSON Schema objects for Swagger, one file per domain, always `as const`.
- `src/lib/prisma.ts` — Single `PrismaClient` instance using `@prisma/adapter-pg` with explicit `schema` support (required for E2E test isolation).
- `src/lib/logger.ts` — Pino logger config per `NODE_ENV`. Development uses `pino-pretty`; production emits raw JSON; test sets `level: 'silent'`. Passed directly to `fastify({ logger })`.

## Project Standards

### Node.js

- Runtime: Node.js >= 22 (enforced in `package.json` `engines` field; exact range is `>=22.14.0 <23`).
- Project is pure ESM (`"type": "module"`). All imports use ESM syntax.
- Use the `node:` prefix for built-in modules: `import { randomUUID } from 'node:crypto'`.

### TypeScript

- `strict: true`, `verbatimModuleSyntax: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Use `import type { ... }` for any type-only import — required by `verbatimModuleSyntax`.
- Path alias `@/` resolves to `src/`. Use it for all intra-project imports.
- No explicit return-type annotations required on functions unless inference is ambiguous.

### Fastify

- App instance exported from `src/app.ts`; server started in `src/server.ts`.
- Plugin registration order in `app.ts`: Swagger → CORS → RateLimit → JWT → Cookies → domain routes.
- JWT expiry is 10 minutes; refresh token is delivered via `HttpOnly` cookie (`refreshToken`) and expires in 7 days.
- CORS origin is controlled by `CORS_ORIGIN` env var (default: `http://localhost:5173`).
- Rate limiting is registered globally via `@fastify/rate-limit` with `global: false` — apply per-route as needed.
- Use `app.addHook('onRequest', verifyJWT)` at the route-group level to protect all routes in a router. Use `{ onRequest: [verifyJWT] }` on individual routes only when mixed auth is needed within the same router.
- Validate request body/query/params with Zod inside controllers using `.parse()`. Zod errors are caught globally in `app.setErrorHandler` and returned as `400` with formatted issues.
- Error handling pattern in controllers: catch domain errors (e.g., `ResourceNotFoundError`), return the appropriate HTTP status; let unexpected errors bubble to the global handler. The global handler logs 5xx errors with `app.log.error(error)`.

### Logging

- Pino is configured in `src/lib/logger.ts` and passed to Fastify at startup.
- Sensitive fields are redacted via Pino `redact`: `req.headers.authorization`, `req.headers.cookie`, `req.body.password`.
- DB credentials in error messages are scrubbed by a regex serializer on the `err` key.
- Development: `pino-pretty` transport with colorized output (devDependency only).
- Production: raw JSON at `warn` level (no transport).
- Test: `level: 'silent'` — no output during test runs.

### Prisma

- Import the singleton: `import { prisma } from '@/lib/prisma'`.
- Client uses `@prisma/adapter-pg` with a `pg.Pool`. The `schema` query parameter on `DATABASE_URL` controls which PostgreSQL schema is active — used by the E2E test environment to isolate each test suite in its own schema.
- DB column names are `snake_case` via `@map`; TypeScript fields are `camelCase`. Always run `npx prisma generate` after schema changes.
- Migrations live in `prisma/migrations/`. Never edit migration files after committing them.
- `Decimal` columns (amounts) map to `number` in the repository interface types.

### Redis / Cache

- Import the singleton: `import { cache } from '@/infra/cache/cache.service'`.
- Default TTL is 300 seconds. Pass an explicit TTL as the third argument to `cache.set()` when the default is wrong.
- Use `cache.deleteByPattern(pattern)` for bulk invalidation (e.g., invalidating all dashboard keys for a user after a transaction change).
- Redis uses `lazyConnect: true` — the server starts without Redis present. In production, `REDIS_HOST` must be set.

### Swagger / OpenAPI

- All schema objects live in `src/http/schemas/`, named by domain (`transactions.ts`, `users.ts`, etc.).
- Export each schema as a named `const` with `as const`.
- Every protected endpoint schema must include `security: [{ bearerAuth: [] }]`.
- Always define response schemas for success codes (200/201/204) and expected error codes (400/404). Use `type: 'null'` for empty responses (204).
- Attach schemas in `routes.ts` via the `schema` option: `app.post('/foo', { schema: createFooSchema }, handler)`.
- Swagger UI is available at `/docs` in all environments.

### Docker

- `docker-compose.yml` provides `api-zav-pg` (PostgreSQL via `bitnami/postgresql`) and `redis` (`redis:7-alpine`).
- Default credentials: user `docker`, password `docker`, database `apizav`.
- Data for Redis is persisted in the `redis_data` named volume.
- The application itself does not run inside Docker in development — only the infrastructure services do.

## Testing Strategy

**Unit tests** (`vite.config.ts`, `environment: 'node'`):
- Test use cases in `src/use-cases/**/*.spec.ts`.
- Use in-memory repositories (`InMemoryXxxRepository`) — never `prisma` or real Redis.
- Pattern: `let sut: XxxUseCase` (`sut` = system under test), instantiate in `beforeEach`.

**E2E tests** (`vite.e2e.config.ts`, `environment: prisma`):
- Test HTTP controllers in `src/http/controllers/**/*.spec.ts` via `supertest`.
- `prisma-test-environment.ts` creates a UUID-named PostgreSQL schema per test file, runs `prisma migrate deploy`, and drops it on teardown.
- Call `app.ready()` in `beforeAll` and `app.close()` in `afterAll`.
- Use `createAndAuthenticateUser(app)` from `src/utils/test/create-and-authenticate-user.ts` to get a JWT for authenticated requests.

## Environment Variables

```env
NODE_ENV=development
APP_URL=http://localhost:3333
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-here
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/apizav?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
```

`REDIS_HOST` is optional in development (server starts with `lazyConnect`). `APP_URL` is used to set the Swagger server URL in production. `CORS_ORIGIN` controls the allowed frontend origin.

## Implemented Requirements

All 34 requirements in `REQUISITOS.md` are implemented and marked `[X]`. Notable highlights:

- **RNF02/RNF03** — JWT (10 min) + refresh token cookie (7 days, HttpOnly, Secure in prod).
- **RNF05/RN19/RN20** — Dashboard cached in Redis (TTL 300 s); invalidated on every transaction mutation.
- **RNF06** — Pagination on transactions, categories, and goals (`perPage` up to 100 via query param).
- **RNF13** — Unit test coverage target ≥ 80% on use cases.
- **RNF14** — Structured JSON logs via Pino (`src/lib/logger.ts`); `pino-pretty` in dev, raw JSON in prod.
- **RNF15** — Swagger/OpenAPI docs at `/docs`.

# Mandatory Reviews

After EVERY code change, before considering the task complete, you MUST:

1. Execute the security-review skill.
2. Execute the architecture-review skill.
3. Execute the testing-review skill.

Include their results in the final response.

A task is not complete until all reviews have been performed.

# Pull Request Requirements

Before creating any Pull Request:

1. Run lint checks.

```bash
npx eslint src
```

2. Run unit tests.

```bash
npm run test
```

3. Run E2E tests if available.

```bash
npm run test:e2e
```

4. Run production build.

```bash
npm run build
```

If any command fails:

- Stop the PR process.
- Explain the failure.
- Suggest fixes.
- Do not create the Pull Request until all checks pass.
