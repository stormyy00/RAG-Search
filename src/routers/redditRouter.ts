// src/modules/reddit/reddit.router.ts
import { Router } from "express";
import { RedditController } from "../controllers/reddit.controller";

const router = Router();

router.post("/index", RedditController.index);
router.post("/search", RedditController.search);
router.post("/ask", RedditController.ask);
router.post("/stream-ask", RedditController.streamAsk);
router.post("/search-and-index", RedditController.searchAndIndex);

export default router;
