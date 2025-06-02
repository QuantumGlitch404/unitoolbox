
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  type?: 'banner' | 'square' | 'skyscraper';
}

const adTypeDimensions: Record<string, { width: string; height: string }> = {
  banner: { width: '100%', height: '90px' }, // Standard banner
  leaderboard: { width: '100%', height: '90px' }, // Often 728x90
  mediumRectangle: { width: '300px', height: '250px' },
  largeRectangle: { width: '336px', height: '280px' },
  square: { width: '250px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' }, // Wide Skyscraper
  smallSquare: { width: '200px', height: '200px' },
};

export function AdPlaceholder({
  width: customWidth,
  height: customHeight,
  label = "Advertisement",
  className,
  type,
}: AdPlaceholderProps) {
  const dimensions = type ? adTypeDimensions[type] : null;
  const styleWidth = customWidth ?? dimensions?.width ?? '100%';
  const styleHeight = customHeight ?? dimensions?.height ?? '90px';

  return (
    <Card
      className={cn(
        `flex items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg shadow`,
        className
      )}
      style={{ width: styleWidth, height: styleHeight, minHeight: styleHeight }} // Ensure minHeight for percentage heights
      aria-label={label}
    >
      <CardContent className="p-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {typeof styleWidth === 'string' && styleWidth.includes('px') && typeof styleHeight === 'string' && styleHeight.includes('px') && (
          <p className="text-xs text-muted-foreground/70">{`${styleWidth} x ${styleHeight}`}</p>
        )}
         {type && (
          <p className="text-xs text-muted-foreground/50 mt-0.5">({type})</p>
        )}
      </CardContent>
    </Card>
  );
}
