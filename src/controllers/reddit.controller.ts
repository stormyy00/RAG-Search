import { Request, Response } from "express";
import { RedditService } from "../services/reddit.service";

export const RedditController = {
  async index(req: Request, res: Response) {
    try {
      const { posts } = req.body;
      const result = await RedditService.indexPosts(posts);
      res.json({ message: "Indexed successfully", ...result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to index posts" });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const { query, subreddit } = req.body;
      const result = await RedditService.search(query, subreddit);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search failed" });
    }
  },

  async ask(req: Request, res: Response) {
    try {
      const { question, includeComments = false, options = {} } = req.body;

      if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      const result = await RedditService.ask(question, includeComments, options);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ask failed" });
    }
  },

  async searchAndIndex(req: Request, res: Response) {
    try {
      const { query, options = {} } = req.body;

      if (!query) {
        res.status(400).json({ error: "Query is required" });
        return;
      }

      const result = await RedditService.searchAndIndex(query, options);
      res.json({
        message: "Reddit search and indexing completed",
        ...result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search and index failed" });
    }
  },

  async streamAsk(req: Request, res: Response) {
    try {
      const { question, includeComments = false, options = {} } = req.body;

      if (!question) {
        res.status(400).json({ error: "Question is required" });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const sendEvent = (type: string, data: unknown) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
      };

      try {
        await RedditService.askWithStreaming(
          question,
          includeComments,
          options,
          sendEvent
        );
        res.end();
      } catch (error) {
        sendEvent('error', { message: error instanceof Error ? error.message : 'Unknown error occurred' });
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Stream failed" });
    }
  },
};
