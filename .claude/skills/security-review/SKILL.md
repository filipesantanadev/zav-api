# Security Review Skill

Perform a structured security review of the current branch diff against `main`. Work through each category below in order. At the end produce a Security Score.

## How to Run

1. Get the diff: `git diff main...HEAD`
2. Also read any new or modified files in full — diff alone can miss context.
3. Work through every category. For each finding write:
   - **[SEVERITY]** `file:line` — description of the issue and how to fix it.
   - Severity levels: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` / `INFO`.
4. If a category has no findings, write "No issues found."
5. After all categories, compute and display the Security Score.

---

## Category 1 — Authentication & JWT

Check `src/http/middlewares/verify-jwt.ts`, `src/app.ts`, and any route that handles tokens.

- Are all sensitive routes protected with `verifyJWT`?
- Is the JWT secret sourced from `env.JWT_SECRET` (never hardcoded)?
- Is JWT expiry set correctly (access token 10 min, refresh via HttpOnly cookie)?
- Does the refresh flow (`PATCH /token/refresh`) rotate the token or reuse it unsafely?
- Are there any endpoints that accept a token in a query string (leaks in logs/history)?
- Does `request.user.sub` get validated to be a real user before use, or just trusted from the token?

## Category 2 — Authorization (Ownership)

Check use cases and Prisma queries across `src/use-cases/` and `src/repositories/prisma/`.

- Does every data-fetch/update/delete query filter by `userId` so users cannot access other users' resources?
- Are there any controller actions that use a resource ID from the URL without verifying it belongs to the authenticated user?
- Can a user escalate privileges (e.g., modify another user's categories, transactions, or goals)?

## Category 3 — Input Validation

Check all controllers in `src/http/controllers/`.

- Is every incoming `request.body`, `request.params`, and `request.query` parsed through a Zod schema?
- Are numeric fields validated as positive where appropriate (amounts, pagination)?
- Are UUIDs validated with `.uuid()` before being used in DB queries?
- Are date fields coerced and validated (`z.coerce.date()`)?
- Is there any raw string concatenation passed to Prisma's `$queryRaw` or `$executeRaw`? (SQL injection risk)
- Are there any `z.any()` or missing validations on user-supplied fields?

## Category 4 — Sensitive Data Exposure

Check response serialization, logging, and Swagger schemas.

- Is `passwordHash` ever included in API responses?
- Are JWT secrets, database credentials, or Redis URIs ever logged or returned in error messages?
- Does the global error handler in `app.ts` avoid leaking stack traces in production (`NODE_ENV !== 'production'` guard)?
- Do Swagger response schemas accidentally document internal fields (e.g., `passwordHash`, internal IDs)?

## Category 5 — Logging & Auditability

Check `src/app.ts`, controllers, and use cases.

- Are authentication failures (wrong password, expired token) logged at an appropriate level?
- Are critical state changes (user creation, goal cancellation, large transactions) logged?
- Is there any logging of raw user passwords or tokens?
- Is structured logging (Pino) missing where it matters for incident response? (Note: Pino is planned but not yet implemented — flag the gap.)

## Category 6 — OWASP Top 10 Checklist

Cross-reference the diff against the OWASP Top 10 (2021):

| # | Risk | Status |
|---|------|--------|
| A01 | Broken Access Control | Check ownership enforcement above |
| A02 | Cryptographic Failures | bcrypt cost factor >= 10? HTTPS enforced in prod? |
| A03 | Injection | Raw SQL? Template literals in queries? |
| A04 | Insecure Design | Business logic flaws (e.g., can amount be 0 or negative?) |
| A05 | Security Misconfiguration | CORS missing? Helmet/rate-limit missing? |
| A06 | Vulnerable Components | Any `npm audit` findings for changed deps? |
| A07 | Auth & Session Mgmt | Token rotation? Logout invalidation? |
| A08 | Software Integrity | No lock-file changes that introduce unexpected packages? |
| A09 | Logging & Monitoring | Auth failures and errors logged? |
| A10 | SSRF | Any user-supplied URLs fetched server-side? |

For each item: mark `PASS`, `FAIL`, or `N/A` and add a note if `FAIL`.

## Category 7 — Docker & Infrastructure

Check `docker-compose.yml` and any Dockerfile present.

- Are default credentials (`docker`/`docker`) used? Flag if this applies to non-dev environments.
- Are any secrets (JWT secret, DB password) hardcoded in `docker-compose.yml`?
- Are images pinned to specific versions or using `latest`?
- Is the PostgreSQL port (5432) or Redis port (6379) exposed unnecessarily in production?
- Are volumes configured for data persistence?

## Category 8 — Dependency Security

Check `package.json` for any newly added or updated packages in the diff.

- Run: `npm audit --audit-level=high` (report findings).
- Are new dependencies from reputable sources? Any typosquatting risk?
- Are `devDependencies` correctly separated from `dependencies`?
- Are version ranges overly permissive (e.g., `*` or `>=0.0.0`)?

---

## Security Score

After all categories, compute the score as follows:

| Finding count | Points deducted |
|---------------|----------------|
| Each CRITICAL | −20 |
| Each HIGH     | −10 |
| Each MEDIUM   | −5  |
| Each LOW      | −2  |
| Each INFO     | −0  |

**Score = 100 − total deductions** (floor at 0).

Display the result in this format:

```
## Security Score: XX/100

CRITICAL: N  HIGH: N  MEDIUM: N  LOW: N

Grade:
  90–100 → Secure
  70–89  → Acceptable, fix HIGH issues before merging
  50–69  → Needs work, do not merge without addressing CRITICAL/HIGH
  0–49   → Unsafe, significant rework required
```

End with a prioritized list of the top 3 actions to take before this change is merged.
