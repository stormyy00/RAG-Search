import { pgTable, serial, text, jsonb, vector, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `${name}`);

export const redditDocuments = createTable("reddit_documents", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
  metadata: jsonb("metadata").$type<{
    subreddit: string;
    redditId: string;
    title?: string;
    postUrl?: string;
    score?: number;
    author?: string;
    commentCount?: number;
    isComment?: boolean;
    commentScore?: number;
    commentAuthor?: string;
    createdUtc?: number;
  }>(),
});