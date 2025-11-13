'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SearchState,
  ThinkingStep,
  StreamEvent,
  StepEventData,
  ChunkEventData,
  SourcesEventData,
  MetadataEventData,
  DoneEventData,
  ErrorEventData,
} from '@/types/search';

interface UseSearchStreamResult extends SearchState {
  startSearch: () => void;
  resetSearch: () => void;
}

export function useSearchStream(query: string): UseSearchStreamResult {
  const [state, setState] = useState<SearchState>({
    currentStep: '',
    steps: [],
    answer: '',
    sources: [],
    metadata: null,
    isStreaming: false,
    isComplete: false,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const searchStartedRef = useRef(false);
  const answerBufferRef = useRef<string>('');
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushBuffer = useCallback(() => {
    if (answerBufferRef.current) {
      const bufferedText = answerBufferRef.current;
      answerBufferRef.current = '';
      setState((prev) => ({
        ...prev,
        answer: prev.answer + bufferedText,
      }));
    }
  }, []);

  const resetSearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = null;
    }
    answerBufferRef.current = '';
    searchStartedRef.current = false;
    setState({
      currentStep: '',
      steps: [],
      answer: '',
      sources: [],
      metadata: null,
      isStreaming: false,
      isComplete: false,
      error: null,
    });
  }, []);

  const startSearch = useCallback(() => {
    if (!query || searchStartedRef.current) {
      return;
    }

    searchStartedRef.current = true;
    resetSearch();

    setState((prev) => ({
      ...prev,
      isStreaming: true,
      error: null,
    }));

    fetch('/api/search-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: query }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        const readStream = (): void => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                setState((prev) => ({
                  ...prev,
                  isStreaming: false,
                  isComplete: true,
                }));
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.slice(6)) as StreamEvent;
                    handleStreamEvent(eventData);
                  } catch (error) {
                    console.error('Failed to parse SSE data:', error);
                  }
                }
              }

              readStream();
            })
            .catch((error) => {
              console.error('Stream reading error:', error);
              setState((prev) => ({
                ...prev,
                isStreaming: false,
                error: error instanceof Error ? error.message : 'Stream reading failed',
              }));
            });
        };

        readStream();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Failed to start search',
        }));
        searchStartedRef.current = false;
      });
  }, [query, resetSearch]);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'step': {
        const stepData = event.data as StepEventData;
        setState((prev) => {
          // Mark previous step as completed
          const updatedSteps = prev.steps.map((s) => ({ ...s, completed: true }));
          // Add new step
          const newStep: ThinkingStep = {
            text: stepData.text,
            completed: false,
            timestamp: Date.now(),
          };
          return {
            ...prev,
            currentStep: stepData.text,
            steps: [...updatedSteps, newStep],
          };
        });
        break;
      }

      case 'chunk': {
        const chunkData = event.data as ChunkEventData;

        // Buffer chunks and update every 50ms to reduce re-renders
        answerBufferRef.current += chunkData.text;

        if (bufferTimeoutRef.current) {
          clearTimeout(bufferTimeoutRef.current);
        }

        bufferTimeoutRef.current = setTimeout(() => {
          flushBuffer();
        }, 50);
        break;
      }

      case 'sources': {
        const sourcesData = event.data as SourcesEventData;
        setState((prev) => ({
          ...prev,
          sources: sourcesData.sources,
        }));
        break;
      }

      case 'metadata': {
        const metadataData = event.data as MetadataEventData;
        setState((prev) => ({
          ...prev,
          metadata: metadataData,
        }));
        break;
      }

      case 'done': {
        const doneData = event.data as DoneEventData;

        // Flush any remaining buffered content
        flushBuffer();

        setState((prev) => ({
          ...prev,
          currentStep: '',
          steps: prev.steps.map((s) => ({ ...s, completed: true })),
          answer: doneData.answer,
          sources: doneData.sources,
          metadata: doneData.metadata,
          isStreaming: false,
          isComplete: true,
        }));
        break;
      }

      case 'error': {
        const errorData = event.data as ErrorEventData;
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: errorData.message,
        }));
        break;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startSearch,
    resetSearch,
  };
}
