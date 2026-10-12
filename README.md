# Fresh Quiz

> There's also a Spring Boot + Angular version of this project:
> [angular-spring-quiz](https://github.com/ErickHTF/angular-spring-quiz).

Real-time quiz game about web fundamentals, built with Fresh, Preact, SSE and
PostgreSQL.

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

## Structure

- `routes/`: HTTP routes and handlers (Fresh file-based routing); the API lives
  in `routes/api/`.
- `islands/`: interactive components hydrated on the client (SSE, voting,
  ranking).
- `components/`: SSR-only components, with no client-side JavaScript.
- `server/`: server-only logic; `server/game/` splits the game domain into
  repository, timed reveal and services.
- `shared/`: isomorphic types and functions used by both the server and the
  islands.
- `db/`: migrations, seed and Postgres init; `db/scripts/` holds the
  `db:migrate` and `db:seed` commands.
- `assets/`: CSS processed by Vite (imported in `client.ts`).
- `static/`: files served as-is (favicon, logo).
- `deploy/`: systemd unit, deploy/reset scripts and provisioning guide.
- `.github/`: CI and manual deploy workflows.

The `_fresh/` folder is the build output (generated, not version-controlled).

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

The provisioning guide is in [`deploy/SETUP.md`](deploy/SETUP.md).

## Game Lifecycle

- The host creates a room at `/host` with a nickname and shares the code.
- Players join from the home page with a nickname.
- The host's name is highlighted for everyone, in a section separate from the
  ranking.
- The host watches the voting live (with a timer until the reveal) and starts
  the quiz; each question's answer is revealed automatically when time runs out.
  After the reveal, the host moves on to the next question (or to the final
  results) or ends early ("Encerrar quiz").
- At the end, "Jogar novamente" (Play again) sends the room back to the lobby,
  resetting scores and answers — connected players stay in the room.
- "Sair da sala" (host) and "Sair" (player) clear the session cookies.

## API

| Method | Route                      | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| POST   | `/api/games`               | Creates a room (sets the host cookie).      |
| POST   | `/api/games/:code/join`    | Joins a room (sets the player cookies).     |
| GET    | `/api/games/:code/state`   | Current game state.                         |
| GET    | `/api/games/:code/events`  | SSE stream with real-time state.            |
| POST   | `/api/games/:code/start`   | Starts the first question (host).           |
| POST   | `/api/games/:code/answer`  | Records the player's answer.                |
| POST   | `/api/games/:code/next`    | Advances past the revealed question (host). |
| POST   | `/api/games/:code/finish`  | Ends the quiz early (host).                 |
| POST   | `/api/games/:code/restart` | Back to the lobby, resetting scores (host). |
| POST   | `/api/games/:code/leave`   | Clears the session cookies.                 |
| GET    | `/health`                  | Health check (app + database).              |
