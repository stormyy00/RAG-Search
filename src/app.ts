import express from "express";
import redditRouter from "./routers/redditRouter";


const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Express + TypeScript API running!");
});
app.use("/reddit", redditRouter);

export default app;
