export function resolveBoothPhase(
  currentSession: { phase: string } | null | undefined,
): string {
  return currentSession?.phase ?? 'attract';
}
