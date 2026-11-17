# Coy Discover

A swipe-based Discover tab for the Coy SDE Intern assignment. Built with a Next.js frontend and a separate Express API, both in JavaScript. Home is blank as required.

## Stack

- Next.js App Router, React, Tailwind CSS, and Motion
- Express, Prisma, and SQLite
- Node test runner, Supertest, and Playwright

Requires Node.js 22.18+ and npm.

The backend uses npm overrides for patched Prisma configuration dependencies.

## Local setup

### Backend

In one terminal:

```sh
cd backend
npm ci
```

Copy `.env.example` to `.env`, then run:

```sh
npm run db:setup
npm run dev
```

The API runs at http://localhost:4000/api. Setup generates Prisma Client, applies migrations, and seeds 32 profiles. Running it again preserves existing swipes.

### Frontend

In a second terminal:

```sh
cd frontend
npm ci
```

Copy `.env.example` to `.env.local`, then run:

```sh
npm run dev
```

Open http://localhost:3000.

On PowerShell, use `Copy-Item` to copy environment files and `npm.cmd` if execution policy blocks `npm.ps1`. On macOS/Linux, use `cp`.

## Configuration

| Application | Variable              | Example                     |
| ----------- | --------------------- | --------------------------- |
| Frontend    | `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` |
| Backend     | `DATABASE_URL`        | `file:./dev.db`             |
| Backend     | `PORT`                | `4000`                      |
| Backend     | `FRONTEND_ORIGIN`     | `http://localhost:3000`     |

The SQLite file is stored at `backend/prisma/dev.db` and excluded from Git. If ports or hosts change, update both environment files and restart the apps. Rebuild the frontend when changing its production API URL.

## Demo

1. Like Aanya, the first profile in a fresh database, to see a mutual match.
2. Open Matches, then reload to check persistence.
3. Return to Discover and like Rohan for a one-sided like, or pass using the X button or a left drag.
4. Swiped profiles stay out of the feed. Once all profiles are swiped, Discover shows an empty state.

The profiles are fictional. Stock portraits are placeholders and may repeat; failed image loads fall back to initials.

To reset a local demo, stop the backend and run the following from `backend/`. **This deletes the local database contents.**

```sh
npx prisma migrate reset --force --skip-seed
npm run db:seed
```

## API

All endpoints use the assumed demo user.

| Method | Endpoint       | Response                                          |
| ------ | -------------- | ------------------------------------------------- |
| GET    | `/api/health`  | `{ "status": "ok" }`                              |
| GET    | `/api/feed`    | `{ "profiles": [...] }`                           |
| POST   | `/api/swipe`   | `{ "matched": boolean, "match": object or null }` |
| GET    | `/api/matches` | `{ "matches": [...] }`                            |

Swipe request:

```json
{ "profileId": "profile-01", "action": "like" }
```

Actions are `like` or `pass`. Invalid input returns 400, unknown profiles 404, and duplicate swipes 409. Errors use `{ "error": "..." }`.

## Persistence and privacy

Swipes are saved before a response is sent. A unique user/profile constraint prevents duplicate decisions, including concurrent requests. Matches are derived from reciprocal likes.

The feed returns only public profile fields. Passes and one-sided likes both return `{ "matched": false, "match": null }`. Incoming likes are never sent to the frontend. Failed saves keep the current card available; conflicts refresh the feed.

There is one shared demo account and no authentication, as allowed by the assignment. A real multi-user app would need authenticated accounts and per-user authorization.

## Tests and build

From `backend/`:

```sh
npm test
```

From `frontend/`:

```sh
npm test
npm run build
npm start
```

Run `npm start` from `backend/` for the production API.

For browser tests, run from `frontend/`:

```sh
npx playwright install chromium
npm run test:e2e
```

Windows tests use installed Microsoft Edge when available. Browser tests use ports 3001/4001 and a separate SQLite database. They do not change the development database.

The suite covers matching, privacy, validation, concurrency, persistence, empty states, swipe gestures, and request failures.

## Deployment

Deploy `frontend/` to Vercel with the production API URL. The Express backend needs a Node host with a persistent disk for SQLite. Configure CORS for the deployed frontend and run migrations before starting the API.

For a hosted PostgreSQL database, change the Prisma provider and create new migrations. The SQLite migration cannot be reused with PostgreSQL.

## Project structure

- `frontend/` — Next.js pages, components, API client, and frontend tests.
- `backend/` — Express API, Prisma schema, migrations, seed data, and API tests.
