import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./db-types";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: process.env.DATABASE_DB,
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      port: 5432,
      password: process.env.DATABASE_PASSWORD,
      max: 10,
    }),
  }),
});
