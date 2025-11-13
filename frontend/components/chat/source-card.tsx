import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, MessageSquare, TrendingUp, User } from 'lucide-react';
import { RedditSource } from '@/types/search';
import Link from 'next/link';
  
type SourceCardProps = {
  source: RedditSource;
}

const SourceCard = ({ source }: SourceCardProps) => {
  const getSimilarityColor = (score: number): string => {
    if (score >= 0.8) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    if (score >= 0.6) return 'bg-orange-400/10 text-orange-500 border-orange-400/20';
    return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <Card className="hover:shadow transition-shadow border-t-0 bg-transparent shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2">
            {source.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={getSimilarityColor(source.similarityScore)}
          >
            {(source.similarityScore * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">r/{source.subreddit}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>u/{source.author}</span>
          </div>
          {!source.isComment && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{source.score.toLocaleString()} points</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{source.commentCount.toLocaleString()} comments</span>
              </div>
            </>
          )}
          {source.isComment && (
            <Badge variant="secondary" className="text-xs">
              Comment
            </Badge>
          )}
        </div>
        <Link
          href={source.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm hover:underline text-orange-500 hover:text-orange-600 font-medium"
        >
          View on Reddit
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default SourceCard;  