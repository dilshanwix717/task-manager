# Task Tracker

A full-stack task tracking application with role-based access control and real-time updates.

- **Backend** — NestJS (layered architecture), PostgreSQL + TypeORM, JWT auth, Socket.IO
- **Frontend** — Next.js (App Router), TanStack Query, Zustand, Tailwind CSS + shadcn/ui
- **Infra** — Docker Compose, GitHub Actions CI

## Features

- User registration and login (JWT), with `USER` and `ADMIN` roles
- Task CRUD: title, description, status (`TODO` / `IN_PROGRESS` / `DONE`), due date, owner
- Task listing with pagination and filtering by status and owner
  - a `USER` only ever sees and manages their own tasks
  - an `ADMIN` sees and manages everyone's tasks and can filter by owner
- Real-time task updates over Socket.IO — connected clients see creates/updates/deletes without refreshing
- Request validation with meaningful error responses and appropriate HTTP status codes
- Global + per-endpoint rate limiting on the public edge
- Swagger API docs, Postman collection, unit + e2e tests, CI pipeline

## Quick start (Docker)

The whole stack runs with one command:

```bash
docker compose up --build
```

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | http://localhost:3000                          |
| API      | http://localhost:4000                          |
| Swagger  | http://localhost:4000/api-documentation        |
| Postgres | localhost:5432 (`postgres` / `postgres`)       |

A default admin account is seeded on first start:

```
admin@tasktracker.dev / admin123
```

Register any new account through the UI to get a regular `USER`.

## Manual setup

### Prerequisites

- Node.js 22+
- PostgreSQL 16 (or run just the database with `docker compose up -d postgres`)

### Backend

```bash
cd backend
npm install
npm run start:dev
```

The API starts on `http://localhost:4000`. Configuration is read from
`config-files/<NODE_ENV>.env` (defaults to `development`):

| Variable                  | Description                          | Default (dev)            |
| ------------------------- | ------------------------------------ | ------------------------ |
| `PORT`                    | API port                             | `4000`                   |
| `DB_HOST` / `DB_PORT`     | PostgreSQL host/port                 | `localhost` / `5432`     |
| `DB_USER` / `DB_PASSWORD` | PostgreSQL credentials               | `postgres` / `postgres`  |
| `DB_NAME`                 | Database name                        | `task_tracker`           |
| `JWT_SECRET`              | Token signing secret                 | dev value, change in prod|
| `ACCESS_TOKEN_EXPIRATION` | Token lifetime                       | `1d`                     |
| `ADMIN_USER_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin | `admin` / `admin@tasktracker.dev` / `admin123` |
| `FRONTEND_URL`            | Extra allowed CORS origin            | `http://localhost:3000`  |

The dev env file is committed intentionally so a reviewer can run the project
without any secret exchange — production values are injected through container
environment variables.

### Database

Create the database once (skip if using Docker, the container creates it):

```sql
CREATE DATABASE task_tracker;
```

Schema is created automatically on boot (`synchronize: true`, see Design decisions).
Roles and the default admin account are seeded by an application startup hook.

### Frontend

```bash
cd frontend
cp .env.example .env.local   # points the app at http://localhost:4000
npm install
npm run dev
```

Open `http://localhost:3000`.

### Tests

```bash
cd backend
npm test          # unit tests (use cases, guards) — no database needed
npm run test:e2e  # e2e tests — needs PostgreSQL running; creates its own task_tracker_test db
```

## API documentation

- **Swagger** — `http://localhost:4000/api-documentation` (live, from the running API)
- **Postman** — import [`postman/task-tracker.postman_collection.json`](postman/task-tracker.postman_collection.json)
  and [`postman/task-tracker.postman_environment.json`](postman/task-tracker.postman_environment.json).
  The *Login* and *Register* requests capture the access token into the environment
  automatically, and *Create task* captures the task id — so the whole collection can be
  run top-to-bottom with zero manual copying.

### Endpoints

| Method   | Path             | Access        | Notes                                                  |
| -------- | ---------------- | ------------- | ------------------------------------------------------ |
| `POST`   | `/auth/register` | public        | creates a `USER`, returns `access_token`               |
| `POST`   | `/auth/login`    | public        | returns `access_token`                                 |
| `POST`   | `/tasks`         | USER, ADMIN   | owner is always the caller                             |
| `GET`    | `/tasks`         | USER, ADMIN   | `page`, `limit`, `status`, `ownerId` (ownerId: admin)  |
| `GET`    | `/tasks/:id`     | owner, ADMIN  | 403 for other users, 404 if missing                    |
| `PATCH`  | `/tasks/:id`     | owner, ADMIN  | partial update                                         |
| `DELETE` | `/tasks/:id`     | owner, ADMIN  | returns 204                                            |
| `GET`    | `/users`         | ADMIN         | paginated, feeds the owner filter                      |
| `GET`    | `/health`        | public        | liveness check                                         |

**Socket.IO** — connect to the API origin with the JWT in the handshake
(`auth: { token }`). Events: `task.created`, `task.updated`, `task.deleted`,
each carrying the task payload. Users receive events for their own tasks;
admins receive everything.

## Architecture

### Backend — layered architecture

```
backend/src
├── domain/            # framework-free core: models, enums, repository interfaces
├── application/       # use cases (one class per operation), business rules live here
└── infrastructure/    # everything that touches the outside world
    ├── entities/          # TypeORM entities (persistence model)
    ├── repositories/      # TypeORM implementations of domain interfaces
    ├── controllers/       # thin HTTP layer: DTO validation + delegation to use cases
    ├── auth-module/       # JWT guards, role guard, password hashing, login/register
    ├── gateways/          # Socket.IO gateway behind an events-publisher port
    └── configurations/    # env config + TypeORM wiring
```

Dependencies point inwards: controllers depend on use cases, use cases depend on
domain interfaces, and the TypeORM repositories implement those interfaces. Wiring is
done with symbol-based DI tokens, so any layer can be swapped or mocked in isolation —
this is what the unit tests do.

### Frontend

```
frontend/src
├── app/               # App Router pages (login, register, tasks list, task details)
├── api/               # axios instance (token interceptor + 401 handling) + api functions
├── hooks/             # TanStack Query hooks + the socket.io cache-sync hook
├── store/             # zustand auth store (persists jwt, decodes user from it)
└── components/        # ui kit, forms, dialogs, table, filters, route guards
```

Server state lives in TanStack Query; the Socket.IO hook invalidates/patches the
query cache when task events arrive, which is what makes every open client update
without a refresh.

## Design decisions

- **Layered architecture with use cases** — each operation (e.g. `UpdateTaskUseCase`) is
  a single injectable class implementing `IUseCase<Params, Result>`. Authorization rules
  (owner-or-admin) are enforced *inside* the use cases, not in controllers, so they hold
  regardless of transport (HTTP today, anything else tomorrow).
- **RBAC in two levels** — the global `RoleGuard` handles coarse route access
  (e.g. `/users` is admin-only), while ownership checks are fine-grained business rules
  in the application layer, unit-tested for the full owner/other-user/admin matrix.
- **Socket.IO over SSE/raw WebSockets** — task events must be *targeted*: a user may only
  receive events for their own tasks. Socket.IO rooms (`user:{id}` + `admins`) give
  per-user targeting, reconnection and fallbacks out of the box, and the connection is
  authenticated with the same JWT as the HTTP API. Use cases publish through an
  `ITaskEventsPublisher` port, so the application layer stays transport-agnostic.
- **`synchronize: true` instead of migrations** — deliberate for a take-home: the reviewer
  gets a working schema with zero steps. In production this would be TypeORM migrations
  (listed under future improvements).
- **Consistent response envelope** — list endpoints return
  `{ count, currentPage, offset, results }` and every response is serialized through
  presenter DTOs (`@Expose`-based whitelisting), so fields like password hashes can never
  leak.
- **Security posture** — bcrypt password hashing, identical error messages for
  unknown-email vs wrong-password (no account enumeration), global 100 req/min throttle
  with a stricter 10 req/min on the public auth endpoints, validation whitelisting that
  strips unknown properties, and an HTTP logger that intentionally logs no headers or
  bodies (credentials never hit the logs).

## Assumptions

- Self-registration always creates a `USER`; the single `ADMIN` is seeded from environment
  variables at startup (a "first admin" bootstrap). Admins are not created through the API.
- The task owner is always the creator — admins manage everyone's tasks but do not
  reassign ownership.
- A user filtering the list by someone else's `ownerId` gets `403` rather than an empty
  result, to make the access rule explicit.
- Due dates are stored as timestamps (with timezone) and may be in the past — no business
  rule forbids it.
- JWT is stored in localStorage and sent as a Bearer header. Acceptable for this scope;
  the hardened alternative is an httpOnly refresh-token cookie (future improvements).
- Deleting a user (not exposed via API) cascades to their tasks at the DB level.

## Future improvements

- TypeORM migrations instead of `synchronize: true`
- Refresh tokens + httpOnly cookies; logout-side token invalidation
- Optimistic UI updates (the current UI waits for the server, realtime covers other clients)
- Frontend component/e2e tests (Testing Library / Playwright)
- Task search, sorting, labels and comments; soft delete with an audit trail
- Continuous deployment (build + push images from CI) and observability (structured logs, metrics, tracing)

## Project structure

```
.
├── backend/            # NestJS API
├── frontend/           # Next.js app
├── postman/            # Postman collection + environment
├── .github/workflows/  # CI (lint, build, unit + e2e tests on push/PR)
└── docker-compose.yml  # postgres + backend + frontend
```
