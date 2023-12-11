import express from "express";
import { userCountRoute } from "./routes/userCount";
import cors from "cors";
import { userListRoute } from "./routes/userList";
import { threadsListRoute } from "./routes/threadsList";
import { sendMessageRoute } from "./routes/sendMessage";
import { conversationRoute } from "./routes/conversation";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.get("/user-count", userCountRoute);
app.get("/users", userListRoute);

app.get("/threads", threadsListRoute);
app.post("/message", sendMessageRoute);
app.get("/conversation/:id", conversationRoute);

app.listen(3080);
