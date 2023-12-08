import { db } from "../db";
import { route } from "../route";
import { sendWSMessageToUser } from "../websocket";

export const sendMessageRoute = route(async (req, res) => {
  const created_at = new Date().toISOString();

  const senderId = req.headers["x-user-id"] as string;

  const message = {
    sender_id: senderId,
    receiver_id: req.body.receiverId,
    content: req.body.content,
    created_at,
  };

  const returned = await db
    .insertInto("messages")
    .values(message)
    .returning("id")
    .executeTakeFirst();

  if (!returned) {
    res.sendStatus(500);
    return;
  }

  const msg = {
    id: returned.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    content: message.content,
    createdAt: created_at,
  };
  sendWSMessageToUser(req.body.receiverId, "message", msg);
  sendWSMessageToUser(senderId, "message", msg);

  res.json({ messageId: returned.id });
});
