import { db } from "../db";
import { route } from "../route";

export const userListRoute = route(async (_, res) => {
  res.json(await db.selectFrom("users").select(["id", "name"]).execute());
});
