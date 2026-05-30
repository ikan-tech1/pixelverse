import { cn } from '@/lib/cn';

/** The 4-square Pixelverse mark. Themed via palette vars; can pulse. */
export function LogoMark({
  size = 28,
  pulse = false,
  className,
}: {
  size?: number;
  pulse?: boolean;
  className?: string;
}) {
  const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--warn)'];
  const gap = Math.max(1, Math.round(size * 0.07));
  return (
    <span
      className={cn('logo-mark', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap,
        width: size,
        height: size,
        flex: '0 0 auto',
      }}
      aria-hidden="true"
    >
      {colors.map((c, i) => (
        <span
          key={i}
          style={{
            background: c,
            boxShadow: `0 0 ${Math.round(size * 0.25)}px ${c}`,
            animation: pulse ? `glowpulse 2.2s ease-in-out ${i * 0.25}s infinite` : undefined,
          }}
        />
      ))}
    </span>
  );
}
