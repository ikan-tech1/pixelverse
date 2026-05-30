import { type ReactNode } from 'react';
import { PixelIcon, type IconName } from './PixelIcon';

/** Branded "coming online" panel for sections still under construction. */
export function Placeholder({
  icon,
  title,
  children,
  chip = 'Building this',
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  chip?: string;
}) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div
        className="px-panel pixel-grid-bg scanlines"
        style={{
          position: 'relative',
          padding: 'clamp(20px, 5vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <div className="tile-icon" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <PixelIcon name={icon} size={44} />
        </div>
        <h1 className="section-title">{title}</h1>
        <p style={{ color: 'var(--ink-dim)', fontSize: 16, maxWidth: 520 }}>{children}</p>
        <span className="px-chip">
          <PixelIcon name="spark" size={12} />
          {chip}
        </span>
      </div>
    </div>
  );
}
