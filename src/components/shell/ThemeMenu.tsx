import { useEffect, useRef } from 'react';
import { THEMES } from '@/data/themes';
import { useSettings } from '@/store/settings';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export function ThemeMenu({ onClose }: { onClose: () => void }) {
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const play = useSfx();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="px-panel box-glow theme-menu" role="menu">
      <span className="eyebrow" style={{ padding: '2px 4px 6px' }}>
        Theme
      </span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          role="menuitemradio"
          aria-checked={theme === t.id}
          className={cn('theme-option', theme === t.id && 'is-active')}
          onClick={() => {
            setTheme(t.id);
            play('select');
            onClose();
          }}
        >
          <span className="theme-swatches" aria-hidden="true">
            {t.swatches.map((s, i) => (
              <span key={i} style={{ background: s }} />
            ))}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ fontSize: 14 }}>{t.name}</strong>
            <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{t.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
