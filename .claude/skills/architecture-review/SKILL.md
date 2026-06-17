# Architecture Review Skill

Review the current branch diff against `main` for Clean Architecture compliance, layer boundary violations, and structural consistency with the patterns established in this codebase.

## How to Run

1. Get the diff: `git diff main...HEAD`
2. Read any new or modified files in full for context.
3. Work through each category. For each finding write:
   - **[SEVERITY]** `file:line` — what the violation is and how to correct it.
   - Severity levels: `VIOLATION` (must fix) / `SMELL` (should fix) / `SUGGESTION` (worth considering).
4. If a category has no findings, write "No issues found."

---

## Category 1 — Layer Boundary Enforcement

The allowed dependency direction is:
```
HTTP Controllers → Use Cases → Repository Interfaces
                                      ↑
                         Prisma / In-Memory implementations
```

Check for violations:
- Does any use case import from `src/http/` or `src/lib/prisma`?
- Does any controller import a repository directly (bypassing the factory)?
- Does any repository import from `src/use-cases/`?
- Does any factory do more than compose a repository + use case (e.g., contains business logic)?
- Are `prisma` or `cache` imported directly inside a use case instead of being injected via constructor?

## Category 2 — Repository Pattern

Check `src/repositories/` and any new repository code.

- Does every new repository method exist in the interface file (e.g., `transactions-repository.ts`) before being implemented in `prisma/` and `in-memory/`?
- Do both the Prisma and in-memory implementations implement the same interface (same method signatures)?
- Are raw Prisma types leaked through the interface (e.g., `Prisma.Transaction` instead of a plain interface type)?
- Do Prisma implementations handle `Decimal` → `number` conversion consistently?
- Does the in-memory implementation faithfully mirror the Prisma query logic (same filter behavior, same pagination)?

## Category 3 — Use Case Design

Check `src/use-cases/`.

- Does each use case class have exactly one `execute()` method?
- Does `execute()` accept a typed request object and return a typed response object?
- Are there any use cases that do more than one distinct business operation (Single Responsibility)?
- Are domain errors thrown as typed classes from `src/use-cases/errors/` rather than generic `Error` or HTTP status codes?
- Does any use case import another use case directly? (Orchestration should happen at the controller level or via a dedicated use case, not by chaining use case constructors.)
- Are business rules validated in the use case, not in the controller or repository?

## Category 4 — Factory / Dependency Injection

Check `src/use-cases/factories/`.

- Is there a factory function for every new use case?
- Does the factory live in the correct domain subdirectory (`factories/transactions/`, `factories/users/`, etc.)?
- Does the factory instantiate the Prisma repository (not in-memory)?
- Does the controller call the factory once per request (not once at module load)?

## Category 5 — Controller Responsibilities

Check `src/http/controllers/`.

- Does the controller do only: parse → call factory → call use case → serialize response?
- Is there any business logic (date math, conditional branching on domain rules) in the controller that belongs in a use case?
- Is `request.user.sub` (the authenticated user ID) extracted in the controller and passed to the use case, not derived inside the use case?
- Does every controller have a corresponding E2E test file (`*.spec.ts`)?

## Category 6 — Swagger Schema Consistency

Check `src/http/schemas/` and `src/http/controllers/*/routes.ts`.

- Is there a schema object for every new endpoint?
- Does the schema live in `src/http/schemas/<domain>.ts`, not inline in the route file or controller?
- Is every schema exported with `as const`?
- Do request body properties in the schema match the Zod validation schema in the controller?
- Are all protected endpoint schemas decorated with `security: [{ bearerAuth: [] }]`?

## Category 7 — Naming & File Conventions

- Use cases: `<verb>-<noun>.ts` (e.g., `create-transaction.ts`, `fetch-goals.ts`).
- Factories: `make-<verb>-<noun>-use-case.ts`.
- Prisma repos: `prisma-<noun>-repository.ts`.
- In-memory repos: `in-memory-<noun>-repository.ts`.
- Controllers: `<verb>.ts` inside a domain folder (e.g., `transactions/create.ts`).
- Does any new file deviate from these conventions?

## Category 8 — Domain Model Integrity

Check `prisma/schema.prisma` and repository interfaces.

- Do new Prisma models follow the naming conventions (`snake_case` table names via `@@map`, `snake_case` columns via `@map`, `camelCase` TypeScript fields)?
- Are new relations defined with appropriate `onDelete` behavior (Cascade for user-owned data, SetNull for optional references, Restrict when deletion must be blocked)?
- Are indexes defined on all foreign key and common filter columns?
- Are monetary amounts stored as `Decimal @db.Decimal(10, 2)`, not `Float`?

---

## Architecture Summary

After all categories, produce:

```
## Architecture Review Summary

VIOLATIONS: N  SMELLS: N  SUGGESTIONS: N

Top issues to address before merging:
1. ...
2. ...
3. ...

Overall assessment: [Compliant / Minor issues / Significant restructuring needed]
```
