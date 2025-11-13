import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SearchMetadata } from '@/types/search';
import { Info } from 'lucide-react';

type ConfidenceBadgeProps = {
  metadata: SearchMetadata;
}

const ConfidenceBadge = ({ metadata }: ConfidenceBadgeProps) => {
  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'low':
        return 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20';
      default:
        return 'bg-gray-400/10 text-gray-600 border-gray-400/20 hover:bg-gray-400/20';
    }
  };

  const getConfidenceLabel = (confidence: string): string => confidence.charAt(0).toUpperCase() + confidence.slice(1) + ' Confidence';


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${getConfidenceColor(metadata.confidence)} cursor-help flex items-center gap-1`}
          >
            <Info className="h-3 w-3" />
            {getConfidenceLabel(metadata.confidence)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-linear-to-br from-white via-gray-100 to-gray-50 text-black border-0 ">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Similarity Score:</span>{' '}
              {(metadata.avgSimilarityScore * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-semibold">Quality:</span> {metadata.contextQuality}
            </div>
            {metadata.searchedReddit && (
              <div className="text-xs text-muted-foreground pt-1 border-t">
                Fresh data fetched from Reddit
              </div>
            )}
            {metadata.postsIndexed > 0 && (
              <div className="text-xs text-muted-foreground">
                Indexed {metadata.postsIndexed} new posts
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ConfidenceBadge;
