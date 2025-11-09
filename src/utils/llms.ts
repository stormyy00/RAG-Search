import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "./env";

export const llm = new ChatGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY!,
  model: "gemini-2.0-flash",
  temperature: 0.3,
});
