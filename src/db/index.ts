import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __hassanEstatesQueryClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure your PostgreSQL connection string."
  );
}

// Reuse the connection across hot reloads in development.
const queryClient =
  global.__hassanEstatesQueryClient ??
  postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  global.__hassanEstatesQueryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export * as schema from "./schema";
