# Architecture and game lifecycle

[← Back to README](../README.md)

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
