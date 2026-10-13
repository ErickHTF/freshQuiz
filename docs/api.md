# API reference

[← Back to README](../README.md)

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
