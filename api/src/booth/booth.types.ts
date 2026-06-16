import type { GuestScene } from '../themes/theme.types';

export type BoothPhase = 'attract' | 'scene_pick' | 'capture_ready';

export interface BoothEventSummary {
  id: string;
  name: string;
}

export interface BoothThemeSummary {
  id: string;
  name: string;
}

export interface BoothSessionSnapshot {
  id: string;
  sceneId: string | null;
  sceneName: string | null;
}

export interface BoothSnapshot {
  phase: BoothPhase;
  event: BoothEventSummary;
  theme: BoothThemeSummary;
  scenes: GuestScene[];
  config: Record<string, never>;
  session: BoothSessionSnapshot | null;
}
