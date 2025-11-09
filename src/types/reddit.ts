export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  score: number;
  url: string;
  created_utc: number;
  num_comments: number;
  permalink: string;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
}

export interface SearchOptions {
  subreddits?: string[]; // If empty, search all of Reddit
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  limit?: number;
  minScore?: number;
}