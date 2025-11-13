export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SearchMetadata {
  confidence: ConfidenceLevel;
  avgSimilarityScore: number;
  contextQuality: string;
  searchedReddit: boolean;
  postsIndexed: number;
}

export interface RedditSource {
  subreddit: string;
  redditId: string;
  title: string;
  postUrl: string;
  score: number;
  author: string;
  commentCount: number;
  similarityScore: number;
  isComment: boolean;
}

export interface SearchResponse {
  answer: string;
  confidence: ConfidenceLevel;
  avgSimilarityScore: number;
  contextQuality: string;
  searchedReddit: boolean;
  sources: RedditSource[];
  postsIndexed: number;
}

export interface ThinkingStep {
  text: string;
  completed: boolean;
  timestamp: number;
}

export interface SearchState {
  currentStep: string;
  steps: ThinkingStep[];
  answer: string;
  sources: RedditSource[];
  metadata: SearchMetadata | null;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
}

// SSE Event types
export type StreamEventType = 'step' | 'chunk' | 'sources' | 'metadata' | 'done' | 'error';

export interface StepEventData {
  text: string;
  progress?: number;
}

export interface ChunkEventData {
  text: string;
}

export interface SourcesEventData {
  sources: RedditSource[];
}

export interface MetadataEventData {
  confidence: ConfidenceLevel;
  avgSimilarityScore: number;
  contextQuality: string;
  searchedReddit: boolean;
  postsIndexed: number;
}

export interface DoneEventData {
  answer: string;
  sources: RedditSource[];
  metadata: SearchMetadata;
}

export interface ErrorEventData {
  message: string;
}

export type StreamEventData =
  | StepEventData
  | ChunkEventData
  | SourcesEventData
  | MetadataEventData
  | DoneEventData
  | ErrorEventData;

export interface StreamEvent {
  type: StreamEventType;
  data: StreamEventData;
}
