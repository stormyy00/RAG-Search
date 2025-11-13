'use client';

import { useEffect } from 'react';
import { useSearchStream } from '@/hooks/use-search-stream';
import ThinkingSteps from './thinking-steps';
import ConfidenceBadge from './confidence-badge';
import SourceCard from './source-card';
import { MarkdownMessage } from './markdown-message';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SearchResultsProps = {
  query: string;
  autoStart?: boolean;
}

const SearchResults = ({ query, autoStart = true }: SearchResultsProps) => {
  const {
    currentStep,
    steps,
    answer,
    sources,
    metadata,
    isStreaming,
    isComplete,
    error,
    startSearch,
  } = useSearchStream(query);

  useEffect(() => {
    if (autoStart && query) {
      startSearch();
    }
  }, [autoStart, query, startSearch]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold mb-2">{query}</h1>
            {metadata && (
              <div className="flex items-center gap-2">
                <ConfidenceBadge metadata={metadata} />
              </div>
            )}
          </div>

          <Separator />

          {(steps.length > 0 || isStreaming) && (
            <ThinkingSteps steps={steps} currentStep={currentStep} isStreaming={isStreaming} />
          )}

          {answer && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Answer</h2>
              <MarkdownMessage content={answer} />
            </div>
          )}

          {sources.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Sources ({sources.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((source, index) => (
                  <SourceCard key={`${source.redditId}-${index}`} source={source} />
                ))}
              </div>
            </div>
          )}

          {isStreaming && !answer && steps.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-gray-500">Starting search...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;