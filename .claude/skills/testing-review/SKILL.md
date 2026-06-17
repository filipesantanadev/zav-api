# Testing Review Skill

Review the current branch diff against `main` for test coverage, test quality, and adherence to the two-tier testing strategy used in this project.

## How to Run

1. Get the diff: `git diff main...HEAD`
2. Read new/modified test files and their production counterparts in full.
3. Work through each category. For each finding write:
   - **[SEVERITY]** `file:line` — what is wrong and what should be done.
   - Severity levels: `MISSING` (no test exists for a non-trivial change) / `WEAK` (test exists but doesn't cover the case) / `SMELL` (test works but has a quality issue) / `SUGGESTION`.
4. If a category has no findings, write "No issues found."

---

## Category 1 — Coverage Gaps

For every production file modified or added in the diff, check whether a corresponding test exists.

**Unit tests** must exist for every use case in `src/use-cases/`:
- New use case class → `src/use-cases/<domain>/<verb>-<noun>.spec.ts`
- New error class → tested indirectly by the use case spec that throws it

**E2E tests** must exist for every controller in `src/http/controllers/`:
- New controller handler → `src/http/controllers/<domain>/<verb>.spec.ts`
- New route → covered by at least one E2E spec

Flag any modified production file that has no corresponding test change or existing test coverage.

## Category 2 — Unit Test Quality

Check all `src/use-cases/**/*.spec.ts` files in the diff.

- Is an in-memory repository used (never `prisma` or real Redis)?
- Is the pattern `let sut: XxxUseCase` used with `beforeEach` instantiation?
- Does the spec cover the **happy path** (successful execution)?
- Does the spec cover all **domain error branches** (every `throw new XxxError()` in the use case)?
- Are assertions specific — `expect(result.foo).toBe('bar')` — not just `expect(result).toBeDefined()`?
- Are there any tests that pass regardless of the implementation (vacuous tests, e.g., `expect(true).toBe(true)`)?
- Does the test verify the side effect (e.g., item added to `repository.items`) as well as the return value?

## Category 3 — E2E Test Quality

Check all `src/http/controllers/**/*.spec.ts` files in the diff.

- Does every spec call `await app.ready()` in `beforeAll` and `await app.close()` in `afterAll`?
- Is `createAndAuthenticateUser(app)` from `src/utils/test/create-and-authenticate-user.ts` used instead of manually registering users?
- Does the spec test the **actual HTTP response** (status code + body shape) not just internal logic?
- Are protected routes tested **without** a token (expect 401) as well as with one?
- Are ownership tests present — does the spec verify that one user cannot access another user's resources?
- Are edge cases tested: empty list, not found (404), duplicate creation conflicts, invalid UUIDs in params?

## Category 4 — Test Isolation

- Do unit tests use `beforeEach` to create fresh repository instances? (Shared state between tests causes order-dependent failures.)
- Do E2E tests create all data they need within the test (or `beforeAll`) — no reliance on data created by other tests?
- Are there any `afterEach` cleanup steps missing that could leak state?
- Does any test import `prisma` directly (breaks isolation in unit tests)?

## Category 5 — In-Memory Repository Fidelity

When a new method is added to a repository interface, check whether the in-memory implementation was also updated.

- Does the in-memory implementation apply the same filters as the Prisma implementation (same `where` clause logic)?
- For pagination: does the in-memory repo slice by `(page - 1) * perPage` → `page * perPage`?
- For optional filters: does the in-memory repo skip the filter when the value is `undefined`?
- Are `Decimal` amounts represented as `number` consistently in in-memory items?

## Category 6 — Test Configuration

- New unit test files must match the glob `src/use-cases/**/*.spec.ts` from `vite.config.ts`.
- New E2E test files must match the glob `src/http/controllers/**/*.spec.ts` from `vite.e2e.config.ts`.
- Check that no test file is placed in the wrong location (a controller spec in `use-cases/`, or vice versa).
- Are `describe` block names consistent with the pattern used in the project: `'<Action> (e2e)'` for E2E, `'<Use Case Name>'` for unit tests?

## Category 7 — Error Handling Coverage

For every custom error class in `src/use-cases/errors/` touched in the diff:

- Is there a unit test that exercises the code path producing that error?
- Is there an E2E test that verifies the correct HTTP status code is returned when that error is thrown?
- Does the controller `catch` the error and map it to the right status code?

---

## Testing Review Summary

After all categories, produce:

```
## Testing Review Summary

MISSING: N  WEAK: N  SMELLS: N  SUGGESTIONS: N

Untested code paths (highest risk):
1. ...
2. ...
3. ...

Test health: [Good / Needs improvement / Significant gaps]

Recommended actions before merging:
- [ ] ...
- [ ] ...
```
