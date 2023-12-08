import { db } from "../db";
import { route } from "../route";

export const conversationRoute = route(async (req, res) => {
  const userId = req.headers["x-user-id"] as string;

  res.json(
    await db
      .selectFrom("messages")
      .where((eb) =>
        eb.or([
          eb.and([
            eb("sender_id", "=", userId),
            eb("receiver_id", "=", req.params.id),
          ]),
          eb.and([
            eb("receiver_id", "=", userId),
            eb("sender_id", "=", req.params.id),
          ]),
        ]),
      )
      .select([
        "id",
        "content",
        "created_at as createdAt",
        "sender_id as senderId",
        "receiver_id as receiverId",
      ])
      .execute(),
  );
});
