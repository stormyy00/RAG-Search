import { db } from "../db/index";
import { redditDocuments } from "../db/schema";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { embeddings } from "../utils/embeddings";
import { Document } from "@langchain/core/documents";

export const vectorStore = await PGVectorStore.initialize(embeddings, {
  postgresConnectionOptions: {
    connectionString: process.env.DATABASE_URL!,
  },
  tableName: "reddit_documents",
  columns: {
    idColumnName: "id",
    vectorColumnName: "embedding",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
});

export const RedditRepo = {
  async list() {
    return await db.select().from(redditDocuments);
  },

  async create(doc: typeof redditDocuments.$inferInsert) {
    return await db.insert(redditDocuments).values(doc);
  },

  async insertDocuments(documents: Document[]) {
    await vectorStore.addDocuments(documents);
  },

  async similaritySearch(query: string, k: number = 5, filter?: Record<string, any>) {
    return await vectorStore.similaritySearch(query, k, filter);
  },

  async similaritySearchWithScore(query: string, k: number = 10, filter?: Record<string, any>) {
    return await vectorStore.similaritySearchWithScore(query, k, filter);
  },
};
