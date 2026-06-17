export type BoothPhase =
  | 'attract'
  | 'scene_pick'
  | 'capture_ready'
  | 'processing';

export interface GuestScene {
  id: string;
  name: string;
  tagline: string | null;
  exampleUrl: string;
}

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

export interface BoothConfigSnapshot {
  captureCountdownSeconds: number;
  expectedFaceCount: number;
}

export interface BoothSnapshot {
  phase: BoothPhase;
  event: BoothEventSummary;
  theme: BoothThemeSummary;
  scenes: GuestScene[];
  config: BoothConfigSnapshot;
  session: BoothSessionSnapshot | null;
}
