import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "./env";


export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GOOGLE_API_KEY!,
  model: "text-embedding-004",
});