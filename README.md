# Reddit RAG (Retrieval Augmented Generation) System

A RAG system that fetches Reddit posts, indexes them in a PGVector database, and provides intelligent search functionality using LangChain and Google Gemini.

## Features

- Fetch posts from any subreddit using Reddit's JSON API
- Chunk and embed content using Google's text-embedding-004 model
- Store embeddings in PostgreSQL with pgvector extension
- Perform semantic search with RAG to answer questions based on Reddit content

## Built with 
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=for-the-badge)
![Express.com](https://img.shields.io/badge/Express.com-000?logo=expressdotcom&logoColor=fff&style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=fff&style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=for-the-badge)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000&style=for-the-badge)

## Prerequisites

- Node.js 18+
- PostgreSQL database with pgvector extension
- Google API key for Gemini and embeddings

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Update the `.env` file with your credentials:
   ```env
   DATABASE_URL=postgres://user:password@host:port/database
   GOOGLE_API_KEY=your_google_api_key
   NODE_ENV=development
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

   This will:
   - Enable the pgvector extension
   - Create the `reddit_documents` table with vector support

## Usage

### Running the API Server

Start the Express server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

