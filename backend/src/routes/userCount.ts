import { db } from "../db";
import { route } from "../route";

export const userCountRoute = route(async (_, res) => {
  res.json(
    await db
      .selectFrom("users")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .executeTakeFirstOrThrow(),
  );
});
