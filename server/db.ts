import postgres from "postgres";
import { databaseUrl } from "./config.ts";

export const sql = postgres(databaseUrl, {
  max: 30,
  idle_timeout: 20,
});
