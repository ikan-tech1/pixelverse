import { type ReactNode, useEffect } from 'react';
import { useSfx } from '@/lib/useSfx';

/** Slide-up sheet anchored to the bottom; tap backdrop or × to dismiss. */
export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const play = useSfx();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onPointerDown={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label={title}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <span className="eyebrow">{title}</span>
          <button
            className="sheet-close"
            aria-label="Close"
            onClick={() => {
              play('tap');
              onClose();
            }}
          >
            ×
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
