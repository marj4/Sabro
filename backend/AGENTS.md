# Backend Instructions

Applies to everything inside `backend/`. Root `AGENTS.md` rules still apply; this file adds backend specifics.

## Tech Stack

- Language: Go (latest stable; version pinned in `go.mod`).
- HTTP: standard library `google.golang.org/grpc` with the Go 1.22+ `ServeMux` (method and path-pattern routing). Use `chi` only if middleware grouping becomes necessary.
- Database: PostgreSQL.
- DB driver: `pgx/v5` with `pgxpool` (no ORM).
- Queries: `sqlc` — write SQL in `.sql` files, generate type-safe Go code. Do not hand-write query boilerplate.
- Migrations: `goose` (SQL migrations in `migrations/`, never edit applied migrations).
- Cache / rate limiting / sessions (only when needed): Redis via `go-redis/v9`.
- Config: environment variables, parsed once at startup into a typed struct. No secrets in code or repo.
- Logging: standard library `log/slog` (structured JSON in production).
- Validation: `go-playground/validator/v10` for request DTOs.
- Auth: short-lived JWT access tokens + refresh tokens; passwords hashed with `argon2id`.
- API contract: OpenAPI spec in `api/openapi.yaml` is the source of truth shared with frontend.
- Testing: standard `testing` package, table-driven tests; `testify` for assertions; `testcontainers-go` for DB integration tests.
- Linting: `golangci-lint`; formatting: `gofmt` / `goimports`.
- Containerization: multi-stage Dockerfile, static binary, minimal final image.

## Structure

- `cmd/server/` — entry point only; wiring, no business logic.
- `internal/` — all application code (not importable from outside).
    - `internal/handler/` — HTTP layer: parse, validate, call service, write response.
    - `internal/service/` — business logic.
    - `internal/repository/` — DB access (sqlc-generated code + thin wrappers).
    - `internal/config/`, `internal/middleware/`, `internal/model/`.
- `migrations/` — SQL migrations.
- `api/` — OpenAPI spec.
- Dependencies point inward: handler → service → repository. Never skip layers.

## Go Conventions

- Follow Effective Go and the Go Code Review Comments.
- Accept interfaces, return structs; define interfaces where they are used, keep them small.
- Pass `context.Context` as the first argument to anything doing I/O; respect cancellation and timeouts.
- Wrap errors with context: `fmt.Errorf("doing x: %w", err)`. Never ignore errors; never panic in request paths.
- No global mutable state; use dependency injection via constructors.
- Prefer the standard library over third-party packages.

## Performance

- Reuse the `pgxpool` connection pool; never open connections per request.
- Avoid N+1 queries; use joins or batched queries.
- Add indexes for new query patterns and mention them in the migration.
- Set timeouts on HTTP server, DB queries, and outbound calls.
- Do not optimize prematurely: measure with `pprof` / benchmarks before changing hot paths.
- Use goroutines only with clear ownership and shutdown; protect shared data and run tests with `-race`.

## Security

- All SQL is parameterized (sqlc/pgx); never build queries by string concatenation.
- Validate and limit size of all external input.
- Never log secrets, tokens, passwords, or personal data.
- Use CORS allow-lists, security headers, and rate limiting on auth endpoints.
- Return generic error messages to clients; keep details in logs.

## API Rules

- JSON REST API, versioned under `/api/v1/`.
- Consistent error format: `{"error": {"code": "...", "message": "..."}}`.
- Use correct HTTP status codes.
- Any API change must update `api/openapi.yaml` in the same change.

## Verification

Run before reporting a task as done:

- `gofmt -l .` and `go vet ./...`
- `golangci-lint run`
- `go test -race ./...`
- `sqlc generate` if SQL changed (commit the generated code).
- Add or update tests for new or changed behavior.