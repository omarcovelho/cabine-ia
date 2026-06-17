export const SESSION_PHASES = [
  'scene_pick',
  'capture_ready',
  'processing',
] as const;

export type SessionPhase = (typeof SESSION_PHASES)[number];

export const OPEN_SESSION_PHASES: readonly SessionPhase[] = [
  'scene_pick',
  'capture_ready',
  'processing',
];

export interface SessionDto {
  id: string;
  phase: SessionPhase;
  sceneId: string | null;
  eventId: string;
}

export function isOpenSessionPhase(phase: string): phase is SessionPhase {
  return (OPEN_SESSION_PHASES as readonly string[]).includes(phase);
}

export function toSessionDto(session: {
  id: string;
  phase: string;
  sceneId: string | null;
  eventId: string;
}): SessionDto {
  return {
    id: session.id,
    phase: session.phase as SessionPhase,
    sceneId: session.sceneId,
    eventId: session.eventId,
  };
}
