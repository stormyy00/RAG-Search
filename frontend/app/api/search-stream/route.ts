import ky from 'ky';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ky.post(`${process.env.BACKEND_URL}/reddit/stream-ask`, {
            json: {
              question,
              includeComments: false,
              options: {},
            },
          });

          if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
          }

          if (!response.body) {
            throw new Error('No response body from backend');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorEvent = {
            type: 'error',
            data: {
              message: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
