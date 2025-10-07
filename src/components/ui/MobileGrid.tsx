import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  className,
  cols = 1,
  gap = 4,
  children,
  ...props
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gridGap = {
    2: 'gap-2 sm:gap-4',
    4: 'gap-4 sm:gap-6',
    6: 'gap-6 sm:gap-8',
    8: 'gap-8 sm:gap-12',
  };

  return (
    <div
      className={cn('grid', gridCols[cols], gridGap[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};