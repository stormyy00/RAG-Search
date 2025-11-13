import { SearchResults } from '@/components/chat/search-results';
import e from 'express';

type props = {
  params: Promise<{
    cid: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

const ResultsPage = async ({ searchParams }: props) => {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q;

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">No Query Provided</h1>
          <p className="text-muted-foreground">
            Please provide a search query using the search bar.
          </p>
        </div>
      </div>
    );
  }

  return <SearchResults query={query} autoStart />;
}

export default ResultsPage;