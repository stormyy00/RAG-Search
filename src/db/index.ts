import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { ssl: "require" });

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof drizzle> | undefined;
};

const conn = globalForDb.conn ?? drizzle(client, { schema, logger: process.env.NODE_ENV !== "production" });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = conn;
export const sql = client; 

