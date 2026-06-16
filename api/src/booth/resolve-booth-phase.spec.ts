import { resolveBoothPhase } from './resolve-booth-phase';

describe('resolveBoothPhase', () => {
  it('returns attract when there is no current session', () => {
    expect(resolveBoothPhase(null)).toBe('attract');
    expect(resolveBoothPhase(undefined)).toBe('attract');
  });

  it('returns the current session phase when a session exists', () => {
    expect(resolveBoothPhase({ phase: 'scene_pick' })).toBe('scene_pick');
    expect(resolveBoothPhase({ phase: 'capture_ready' })).toBe('capture_ready');
  });
});
