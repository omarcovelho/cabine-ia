export type BoothPhase = 'attract';

export interface BoothSnapshot {
  phase: BoothPhase;
  theme: null;
  scenes: [];
  config: Record<string, never>;
  session: null;
}
