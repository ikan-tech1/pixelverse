import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';
import type { Sfx } from '@/lib/sound';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'accent' | 'ghost';
  sfx?: Sfx | null;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', sfx = 'click', className, onClick, children, ...rest },
  ref,
) {
  const play = useSfx();
  return (
    <button
      ref={ref}
      className={cn(
        'px-btn',
        variant === 'accent' && 'px-btn--accent',
        variant === 'ghost' && 'px-btn--ghost',
        className,
      )}
      onClick={(e) => {
        if (sfx) play(sfx);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
