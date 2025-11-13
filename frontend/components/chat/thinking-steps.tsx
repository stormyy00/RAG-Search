'use client';

import React, { useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { ThinkingStep } from '@/types/search';

type ThinkingStepsProps = {
  steps: ThinkingStep[];
  currentStep: string;
  isStreaming: boolean;
}

const ThinkingSteps = ({ steps, currentStep, isStreaming }: ThinkingStepsProps) => {
  const [openSteps, setOpenSteps] = React.useState<Set<number>>(new Set());

  useEffect(() => {
    if (steps.length > 0) {
      setOpenSteps(new Set([steps.length - 1]));
    }
  }, [steps.length]);

  const toggleStep = (index: number) => {
    const newOpenSteps = new Set(openSteps);
    if (newOpenSteps.has(index)) {
      newOpenSteps.delete(index);
    } else {
      newOpenSteps.add(index);
    }
    setOpenSteps(newOpenSteps);
  };

  if (steps.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        {isStreaming ? 'Thinking...' : 'Thought Process'}
      </div>
      <div className="space-y-2">
        {steps.map(({ text, completed }, index) => (
          <Collapsible
            key={index}
            open={openSteps.has(index)}
            onOpenChange={() => toggleStep(index)}
          >
            <div className="flex items-center gap-2 w-full text-left p-3 rounded-lg bg-transparent  hover:bg-transparent transition-colors group">
              <div className="shrink-0">
                {completed ? (
                  <Check className="h-4 w-4 text-orange-600" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                )}
              </div>
              <span className="flex-1 text-sm">{text}</span>
              {/* <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180`}
              /> */}
            </div>
            {/* <CollapsibleContent className="pt-2 pl-9">
              <div className="text-xs text-muted-foreground">
                {new Date(step.timestamp).toLocaleTimeString()}
              </div>
            </CollapsibleContent> */}
          </Collapsible>
        ))}

        {isStreaming && currentStep && !steps.find(s => s.text === currentStep && !s.completed) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-transparent  hover:bg-transparent transition-colors group">
            <Loader2 className="h-4 w-4 animate-spin text-orange-600 shrink" />
            <span className="flex-1 text-sm">{currentStep}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThinkingSteps;