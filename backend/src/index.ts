import express from "express";
import { userCountRoute } from "./routes/userCount";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/user-count", userCountRoute);

app.listen(3080);
