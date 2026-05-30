import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Padded, scrollable wrapper for section screens (leaves room for the floating dock). */
export function Screen({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={cn('screen', narrow && 'screen--narrow')}>{children}</div>;
}
