import type { WorldDef } from './types';
import { createCosmos } from './scenes/cosmos';
import { createSand, SandControls } from './scenes/sand';
import { createAquarium } from './scenes/aquarium';
import { createFire } from './scenes/fire';
import { createFlow } from './scenes/flow';
import { createLife, LifeControls } from './scenes/life';
import { createRain } from './scenes/rain';
import { createGarden } from './scenes/garden';

export const WORLDS: WorldDef[] = [
  { id: 'cosmos', name: 'Cosmos', blurb: 'A drifting, twinkling galaxy', hint: 'Touch to spark stars', pixelSize: 3, create: createCosmos },
  { id: 'aquarium', name: 'Aquarium', blurb: 'A calm pixel sea', hint: 'Touch to scatter the fish', pixelSize: 4, create: createAquarium },
  { id: 'sand', name: 'Sand', blurb: 'Pour, flow, and burn', hint: 'Pick an element · drag to pour', pixelSize: 4, create: createSand, Controls: SandControls },
  { id: 'fire', name: 'Bonfire', blurb: 'A living flame', hint: 'Drag to stoke the fire', pixelSize: 4, create: createFire },
  { id: 'flow', name: 'Flow', blurb: 'Rivers of light', hint: 'Drag to steer the current', pixelSize: 3, create: createFlow },
  { id: 'life', name: 'Life', blurb: 'Cells that breathe', hint: 'Draw life · watch it evolve', pixelSize: 5, create: createLife, Controls: LifeControls },
  { id: 'rain', name: 'Rain', blurb: 'A quiet storm', hint: 'Drag for wind · tap for lightning', pixelSize: 3, create: createRain },
  { id: 'garden', name: 'Garden', blurb: 'Grow under a moving sky', hint: 'Tap the ground to plant', pixelSize: 4, create: createGarden },
];
