import { sql } from "kysely";
import { db } from "../db";
import { route } from "../route";

export const threadsListRoute = route(async (req, res) => {
  const userId = req.headers["x-user-id"] as string;

  const threads = await db
    .selectFrom("messages")
    .where((eb) =>
      eb.or([eb("receiver_id", "=", userId), eb("sender_id", "=", userId)]),
    )
    .innerJoin("users as receiver", "receiver.id", "messages.receiver_id")
    .innerJoin("users as sender", "sender.id", "messages.sender_id")
    .select(() => [
      sql<string>`
        CASE WHEN receiver_id = ${userId} THEN sender_id
            ELSE receiver_id
        END
      `.as("id"),
      sql<string>`
        CASE WHEN receiver_id = ${userId} THEN sender.name
            ELSE receiver.name
        END
      `.as("name"),
      sql<string>`content`.as("latestMessageContent"),
      sql<string>`created_at`.as("latestMessageAt"),
    ])
    .execute();

  const groupedThreads: Record<string, any> = {};

  for (const thread of threads) {
    if (!groupedThreads[thread.id]) {
      groupedThreads[thread.id] = thread;
    } else if (
      new Date(thread.latestMessageAt) >
      new Date(groupedThreads[thread.id].latestMessageAt)
    ) {
      groupedThreads[thread.id] = thread;
    }
  }

  res.json(Object.values(groupedThreads));
});
