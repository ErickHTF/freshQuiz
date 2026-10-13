# Development guide

[← Back to README](../README.md)

## Requirements

- Deno 2+
- Docker and Docker Compose

## Development

```bash
cp .env.example .env
docker compose up -d
deno task dev
```

When the Postgres container is created, `db/init/01-setup.sh` automatically
applies the migrations in `db/migrations/` and the seed
(`db/seed/001_web_basics.sql`). To recreate the database from scratch (this
wipes the data):

```bash
docker compose down -v && docker compose up -d
```

If you'd rather run the tasks manually (for example, against an existing
database), use `deno task db:migrate` and `deno task db:seed`.

Postgres is published on host port `5433` to avoid clashing with other local
projects; adjust `DATABASE_URL` in `.env` if needed.

Open `http://localhost:5173/` to join a game or `/host` to create a room.

## Commands

- `deno task dev`: starts the development server.
- `deno task db:migrate`: creates the PostgreSQL schema.
- `deno task db:seed`: inserts the web fundamentals quiz.
- `deno task check`: runs formatting, lint and typecheck.
- `deno task test`: runs the tests.
- `deno task build`: creates the production build.

The initial quiz has questions on HTML, CSS, HTTP, JavaScript, CSS selectors and
APIs.

## Deploy

Production runs on an EC2 instance (Amazon Linux), with `systemd` on port
`:8000`. The `fresh_quiz` database runs on Postgres via Docker Compose on the
instance.

There are two independent workflows, both manual:

- **App** (_Actions → App → Run workflow_): builds, ships only the code,
  restarts the service and checks `/health`; if it fails, it restores the
  previous release. It never touches the database. Restarting drops any games in
  progress (ephemeral state).
- **Database** (_Actions → Database → Run workflow_): type `RESET` and the
  Postgres container is torn down and recreated (`down -v` + `up`), with
  migrations and seed applied on init. Wipes all data.

The provisioning guide is in [`deploy/SETUP.md`](../deploy/SETUP.md).
