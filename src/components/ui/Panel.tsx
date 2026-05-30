import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  inset?: boolean;
};

export function Panel({ glow, inset, className, children, ...rest }: PanelProps) {
  return (
    <div
      className={cn(inset ? 'px-inset' : 'px-panel', glow && 'box-glow', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
