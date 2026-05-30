import { useMemo, useState } from 'react';
import { WORLDS } from '@/worlds/registry';
import { World } from '@/worlds/World';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

function initialIndex(): number {
  const id = window.location.hash.replace('#', '');
  const i = WORLDS.findIndex((w) => w.id === id);
  return i >= 0 ? i : 0;
}

export default function Worlds() {
  // One sketch instance per world, kept alive across visits.
  const sketches = useMemo(() => WORLDS.map((w) => w.create()), []);
  const [active, setActive] = useState(initialIndex);
  const play = useSfx();

  const def = WORLDS[active];
  const Controls = def.Controls;
  const go = (i: number) => {
    const n = (i + WORLDS.length) % WORLDS.length;
    setActive(n);
    history.replaceState(null, '', `#${WORLDS[n].id}`);
    play('select');
  };

  return (
    <div className="worlds">
      {/* Only the active world is mounted + animating (key forces a clean remount). */}
      <div key={active} className="world-panel">
        <World sketch={sketches[active]} pixelSize={def.pixelSize} active />
      </div>

      <div className="world-top">
        <div className="world-id">
          <span className="world-name">{def.name}</span>
          <span className="world-blurb">{def.blurb}</span>
        </div>
        <div className="world-switch">
          <button className="round-btn" aria-label="Previous world" onClick={() => go(active - 1)}>
            ‹
          </button>
          <span className="world-count">
            {active + 1}/{WORLDS.length}
          </span>
          <button className="round-btn" aria-label="Next world" onClick={() => go(active + 1)}>
            ›
          </button>
        </div>
      </div>

      <div className="world-rail" aria-label="Worlds">
        {WORLDS.map((w, i) => (
          <button
            key={w.id}
            className={cn('wp-dot', i === active && 'is-on')}
            aria-label={w.name}
            aria-current={i === active}
            onClick={() => go(i)}
          />
        ))}
      </div>

      <div className="world-bottom">
        {Controls ? <Controls sketch={sketches[active]} /> : <span className="world-hint">{def.hint}</span>}
      </div>
    </div>
  );
}
