import express from "express";
import { userCountRoute } from "./routes/userCount";

const app = express();

app.get("/user-count", userCountRoute);

app.listen(3080);
