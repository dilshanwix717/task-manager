# Task Tracker API

NestJS backend for the Task Tracker application, built with a layered architecture
(domain / application / infrastructure) on PostgreSQL + TypeORM.

See the [root README](../README.md) for full setup instructions, design decisions and API documentation.

## Quick start

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:4000` and serves Swagger docs at `/api-documentation`.
Environment configuration is read from `config-files/<NODE_ENV>.env` (defaults to `development`).
