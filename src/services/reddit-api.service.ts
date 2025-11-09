import { RedditComment, RedditPost, SearchOptions } from "../types/reddit";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const RATE_LIMIT_DELAY = 500; 

export const RedditApiService = {
  async fetchPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RAG-Test-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        subreddit: child.data.subreddit,
        author: child.data.author,
        score: child.data.score,
        url: child.data.url,
        created_utc: child.data.created_utc,
        num_comments: child.data.num_comments || 0,
        permalink: child.data.permalink,
      }));
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      throw error;
    }
  },

  async searchPosts(subreddit: string, query: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RAG-Test-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        subreddit: child.data.subreddit,
        author: child.data.author,
        score: child.data.score,
        url: child.data.url,
        created_utc: child.data.created_utc,
        num_comments: child.data.num_comments || 0,
        permalink: child.data.permalink,
      }));
    } catch (error) {
      console.error('Error searching Reddit posts:', error);
      throw error;
    }
  },

  async searchReddit(query: string, options: SearchOptions = {}): Promise<RedditPost[]> {
    try {
      const {
        subreddits = [],
        timeRange = 'all',
        sort = 'relevance',
        limit = 25,
        minScore = 0,
      } = options;

      // Build search URL
      let searchUrl: string;
      if (subreddits.length === 0) {
        // Search all of Reddit
        searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeRange}&limit=${limit}`;
      } else if (subreddits.length === 1) {
        // Search single subreddit
        searchUrl = `https://www.reddit.com/r/${subreddits[0]}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=${sort}&t=${timeRange}&limit=${limit}`;
      } else {
        // Search multiple subreddits
        const subredditList = subreddits.join('+');
        searchUrl = `https://www.reddit.com/r/${subredditList}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeRange}&limit=${limit}`;
      }

      await delay(RATE_LIMIT_DELAY);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'RAG-Test-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const posts = data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        subreddit: child.data.subreddit,
        author: child.data.author,
        score: child.data.score,
        url: child.data.url,
        created_utc: child.data.created_utc,
        num_comments: child.data.num_comments || 0,
        permalink: child.data.permalink,
      }));

      // Filter by minimum score
      return posts.filter((post: RedditPost) => post.score >= minScore);
    } catch (error) {
      console.error('Error searching Reddit:', error);
      throw error;
    }
  },

  async fetchComments(
    subreddit: string,
    postId: string,
    limit: number = 10,
    minScore: number = 5
  ): Promise<RedditComment[]> {
    try {
      await delay(RATE_LIMIT_DELAY);

      const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RAG-Test-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Comments are in data[1]
      if (!data[1] || !data[1].data || !data[1].data.children) {
        return [];
      }

      const comments: RedditComment[] = [];

      const extractComments = (children: any[]) => {
        for (const child of children) {
          if (child.kind === 't1' && child.data) {
            const comment = child.data;
            // Skip deleted/removed comments and filter by score
            if (
              comment.body &&
              comment.body !== '[deleted]' &&
              comment.body !== '[removed]' &&
              comment.score >= minScore
            ) {
              comments.push({
                id: comment.id,
                body: comment.body,
                author: comment.author,
                score: comment.score,
                created_utc: comment.created_utc,
                permalink: comment.permalink,
              });
            }

            // Recursively extract nested comments (replies)
            if (comment.replies && comment.replies.data && comment.replies.data.children) {
              extractComments(comment.replies.data.children);
            }
          }
        }
      };

      extractComments(data[1].data.children);

      // Sort by score and return top comments
      return comments
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return []; // Return empty array instead of throwing to avoid breaking the flow
    }
  }
};
