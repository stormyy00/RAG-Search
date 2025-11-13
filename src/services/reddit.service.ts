import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { llm } from "../utils/llms";
import { RedditRepo } from "../respository/reddit.repository";
import { RedditApiService } from "./reddit-api.service";
import { SearchOptions } from "../types/reddit";

type ConfidenceLevel = 'high' | 'medium' | 'low';

function getQualityMessage(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high': return "Found highly relevant Reddit discussions";
    case 'medium': return "Found related discussions. Answer may be general.";
    case 'low': return "Limited matches found. Searched Reddit for more context.";
  }
}

export const RedditService = {
  async indexPosts(posts: any[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const docs = posts.map((p) => ({
      pageContent: `${p.title}\n\n${p.content}`,
      metadata: { subreddit: p.subreddit, redditId: p.id },
    }));

    const chunks = await splitter.splitDocuments(docs);
    await RedditRepo.insertDocuments(chunks);
    return { count: chunks.length };
  },

  async search(query: string, subreddit?: string) {
    // Retrieve relevant documents
    const relevantDocs = await RedditRepo.similaritySearch(
      query,
      5,
      subreddit ? { subreddit } : undefined
    );

    // Create a RAG prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context from Reddit posts.

Context from Reddit:
{context}

Question: {question}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information, say so.
`);

    // Combine documents into context
    const context = relevantDocs
      .map((doc, idx) => `[${idx + 1}] ${doc.pageContent}`)
      .join("\n\n");

    // Create and run the chain
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const answer = await chain.invoke({
      context,
      question: query,
    });

    return {
      answer,
      sources: relevantDocs.map((d) => d.metadata),
    };
  },

  async searchAndIndex(
    query: string,
    options: SearchOptions & { includeComments?: boolean } = {}
  ) {
    const { includeComments = false, ...searchOptions } = options;

    // Search Reddit
    const posts = await RedditApiService.searchReddit(query, searchOptions);

    if (posts.length === 0) {
      return { postsFound: 0, postsIndexed: 0, chunksIndexed: 0 };
    }

    // Filter posts with content
    const postsWithContent = posts.filter(p => p.selftext && p.selftext.length > 50);

    // Create documents from posts
    const documents: Document[] = [];

    for (const post of postsWithContent) {
      documents.push({
        pageContent: `${post.title}\n\n${post.selftext}`,
        metadata: {
          subreddit: post.subreddit,
          redditId: post.id,
          title: post.title,
          postUrl: `https://reddit.com${post.permalink}`,
          score: post.score,
          author: post.author,
          commentCount: post.num_comments,
          createdUtc: post.created_utc,
          isComment: false,
        },
      });

      // Fetch and add comments if requested
      if (includeComments && post.num_comments > 0) {
        const comments = await RedditApiService.fetchComments(
          post.subreddit,
          post.id,
          10,
          5
        );

        for (const comment of comments) {
          documents.push({
            pageContent: `Post: ${post.title}\n\nComment by ${comment.author} (${comment.score} points):\n${comment.body}`,
            metadata: {
              subreddit: post.subreddit,
              redditId: post.id,
              title: post.title,
              postUrl: `https://reddit.com${post.permalink}`,
              isComment: true,
              commentScore: comment.score,
              commentAuthor: comment.author,
              createdUtc: comment.created_utc,
            },
          });
        }
      }
    }

    // Split and index documents
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(documents);
    await RedditRepo.insertDocuments(chunks);

    return {
      postsFound: posts.length,
      postsIndexed: postsWithContent.length,
      chunksIndexed: chunks.length,
    };
  },

  async ask(
    question: string,
    includeComments: boolean = false,
    options: SearchOptions & {
      forceRefresh?: boolean;
    } = {}
  ) {
    const {
      forceRefresh = false,
      ...searchOptions
    } = options;

    let searchedReddit = false;
    let postsIndexed = 0;

    // Step 1: Check DB first with similarity scores (unless forceRefresh is true)
    if (!forceRefresh) {
      const resultsWithScores = await RedditRepo.similaritySearchWithScore(question, 10);

      if (resultsWithScores.length > 0) {
        // Calculate average similarity score
        const avgScore = resultsWithScores.reduce((sum, [_, score]) => sum + score, 0) / resultsWithScores.length;

        // Good enough threshold: avg >= 0.7 with at least 3 results
        // Only use cached results if they're truly relevant
        if (avgScore >= 0.7 && resultsWithScores.length >= 3) {
          // Use cached results - high confidence
          const confidence: ConfidenceLevel = 'high';

          const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context from Reddit discussions.

Context from Reddit:
{context}

Question: {question}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information to fully answer the question, say so and provide what information you can.
`);

          const context = resultsWithScores
            .map(([doc], idx) => `[${idx + 1}] ${doc.pageContent}`)
            .join("\n\n");

          const chain = prompt.pipe(llm).pipe(new StringOutputParser());

          const answer = await chain.invoke({
            context,
            question,
          });

          return {
            answer,
            confidence,
            avgSimilarityScore: avgScore,
            contextQuality: getQualityMessage(confidence),
            searchedReddit: false,
            sources: resultsWithScores.map(([doc, score]) => ({
              ...doc.metadata,
              similarityScore: score,
            })),
            postsIndexed: 0,
          };
        }
      }
    }

    // Step 2: Not enough cached data or low confidence - search Reddit
    searchedReddit = true;
    const indexResult = await this.searchAndIndex(question, {
      ...searchOptions,
      includeComments,
    });

    postsIndexed = indexResult.postsIndexed;

    if (indexResult.chunksIndexed === 0) {
      return {
        answer: "I couldn't find any relevant Reddit discussions about this topic. Try rephrasing your question or broadening the search scope.",
        confidence: 'low' as ConfidenceLevel,
        avgSimilarityScore: 0,
        contextQuality: "No relevant discussions found",
        searchedReddit: true,
        sources: [],
        postsIndexed: 0,
      };
    }

    // Step 3: Now search the newly indexed data with scores
    const relevantDocsWithScores = await RedditRepo.similaritySearchWithScore(question, 10);
    const avgScore = relevantDocsWithScores.length > 0
      ? relevantDocsWithScores.reduce((sum, [_, score]) => sum + score, 0) / relevantDocsWithScores.length
      : 0;

    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context from Reddit discussions.

Context from Reddit:
{context}

Question: {question}

Please provide a comprehensive answer based on the context above. Cite specific Reddit posts or comments when relevant. If the context doesn't contain enough information to fully answer the question, say so and provide what information you can.
`);

    const context = relevantDocsWithScores
      .map(([doc], idx) => `[${idx + 1}] ${doc.pageContent}`)
      .join("\n\n");

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const answer = await chain.invoke({
      context,
      question,
    });

    return {
      answer,
      confidence: 'low' as ConfidenceLevel,
      avgSimilarityScore: avgScore,
      contextQuality: getQualityMessage('low'),
      searchedReddit: true,
      sources: relevantDocsWithScores.map(([doc, score]) => ({
        ...doc.metadata,
        similarityScore: score,
      })),
      postsIndexed,
    };
  },

  async askWithStreaming(
    question: string,
    includeComments: boolean = false,
    options: SearchOptions & {
      forceRefresh?: boolean;
    } = {},
    onEvent: (type: string, data: unknown) => void
  ) {
    const {
      forceRefresh = false,
      ...searchOptions
    } = options;

    let searchedReddit = false;
    let postsIndexed = 0;

    onEvent('step', { text: 'Searching database for relevant discussions...' });

    if (!forceRefresh) {
      const resultsWithScores = await RedditRepo.similaritySearchWithScore(question, 10);

      if (resultsWithScores.length > 0) {
        const avgScore = resultsWithScores.reduce((sum, [_, score]) => sum + score, 0) / resultsWithScores.length;

        onEvent('step', {
          text: `Found ${resultsWithScores.length} documents (avg similarity: ${avgScore.toFixed(2)})`
        });

        // Good enough threshold: avg >= 0.7 with at least 3 results
        if (avgScore >= 0.7 && resultsWithScores.length >= 3) {
          const confidence: ConfidenceLevel = 'high';

          onEvent('step', { text: '✅ High confidence match! Using cached discussions...' });

          const prompt = ChatPromptTemplate.fromTemplate(`
You are a search engine that uses Reddit discussions to answer questions based on the provided context.

Context from Reddit:
{context}

Question: {question}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information to fully answer the question, provide what information you can.
`);

          const context = resultsWithScores
            .map(([doc], idx) => `[${idx + 1}] ${doc.pageContent}`)
            .join("\n\n");

          const chain = prompt.pipe(llm).pipe(new StringOutputParser());

          // Stream the answer
          const stream = await chain.stream({
            context,
            question,
          });

          let fullAnswer = '';
          for await (const chunk of stream) {
            fullAnswer += chunk;
            onEvent('chunk', { text: chunk });
          }

          const sources = resultsWithScores.map(([doc, score]) => ({
            ...doc.metadata,
            similarityScore: score,
          }));

          const metadata = {
            confidence,
            avgSimilarityScore: avgScore,
            contextQuality: getQualityMessage(confidence),
            searchedReddit: false,
            postsIndexed: 0,
          };

          onEvent('metadata', metadata);
          onEvent('sources', { sources });
          onEvent('done', { answer: fullAnswer, sources, metadata });

          return;
        } else {
          // Low confidence - need to search Reddit
          onEvent('step', {
            text: `⚠️ Low confidence (${avgScore.toFixed(2)} < 0.7). Searching Reddit for better results...`
          });
        }
      } else {
        onEvent('step', { text: 'No cached results found. Searching Reddit...' });
      }
    }

    // Step 2: Not enough cached data or low confidence - search Reddit
    searchedReddit = true;

    const indexResult = await this.searchAndIndex(question, {
      ...searchOptions,
      includeComments,
    });

    postsIndexed = indexResult.postsIndexed;

    onEvent('step', { text: `Indexed ${postsIndexed} new posts with ${indexResult.chunksIndexed} chunks` });

    if (indexResult.chunksIndexed === 0) {
      const noResultsMetadata = {
        confidence: 'low' as ConfidenceLevel,
        avgSimilarityScore: 0,
        contextQuality: "No relevant discussions found",
        searchedReddit: true,
        postsIndexed: 0,
      };

      const noResultsAnswer = "I couldn't find any relevant Reddit discussions about this topic. Try rephrasing your question or broadening the search scope.";

      onEvent('metadata', noResultsMetadata);
      onEvent('chunk', { text: noResultsAnswer });
      onEvent('sources', { sources: [] });
      onEvent('done', { answer: noResultsAnswer, sources: [], metadata: noResultsMetadata });
      return;
    }

    onEvent('step', { text: 'Analyzing indexed discussions...' });

    const relevantDocsWithScores = await RedditRepo.similaritySearchWithScore(question, 10);
    const avgScore = relevantDocsWithScores.length > 0
      ? relevantDocsWithScores.reduce((sum, [_, score]) => sum + score, 0) / relevantDocsWithScores.length
      : 0;

    onEvent('step', { text: 'Generating comprehensive answer...' });

    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context from Reddit discussions.

Context from Reddit:
{context}

Question: {question}

Please provide a comprehensive answer based on the context above. Cite specific Reddit posts or comments when relevant. If the context doesn't contain enough information to fully answer the question, say so and provide what information you can.
`);

    const context = relevantDocsWithScores
      .map(([doc], idx) => `[${idx + 1}] ${doc.pageContent}`)
      .join("\n\n");

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    const stream = await chain.stream({
      context,
      question,
    });

    let fullAnswer = '';
    for await (const chunk of stream) {
      fullAnswer += chunk;
      onEvent('chunk', { text: chunk });
    }

    const sources = relevantDocsWithScores.map(([doc, score]) => ({
      ...doc.metadata,
      similarityScore: score,
    }));

    const metadata = {
      confidence: 'low' as ConfidenceLevel,
      avgSimilarityScore: avgScore,
      contextQuality: getQualityMessage('low'),
      searchedReddit: true,
      postsIndexed,
    };

    onEvent('metadata', metadata);
    onEvent('sources', { sources });
    onEvent('done', { answer: fullAnswer, sources, metadata });
  },
};
