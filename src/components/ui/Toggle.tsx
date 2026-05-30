import { useSfx } from '@/lib/useSfx';

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const play = useSfx();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="toggle"
      onClick={() => {
        play('select');
        onChange(!checked);
      }}
    >
      <span className="toggle-track" data-on={checked} aria-hidden="true">
        <span className="toggle-knob" />
      </span>
      <span>{label}</span>
    </button>
  );
}
