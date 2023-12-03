import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Attachments {
  id: Generated<string>;
  message_id: string;
}

export interface FlywaySchemaHistory {
  checksum: number | null;
  description: string;
  execution_time: number;
  installed_by: string;
  installed_on: Generated<Timestamp>;
  installed_rank: number;
  script: string;
  success: boolean;
  type: string;
  version: string | null;
}

export interface Messages {
  content: string;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  receiver_id: string;
  sender_id: string;
}

export interface Users {
  id: Generated<string>;
  name: string;
}

export interface DB {
  attachments: Attachments;
  flyway_schema_history: FlywaySchemaHistory;
  messages: Messages;
  users: Users;
}
