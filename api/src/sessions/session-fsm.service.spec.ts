import { SessionFsmService } from './session-fsm.service';
import { InvalidSessionTransitionError } from './session-fsm.errors';

describe('SessionFsmService', () => {
  let fsm: SessionFsmService;

  beforeEach(() => {
    fsm = new SessionFsmService();
  });

  describe('start', () => {
    it('allows start when no open session exists', () => {
      expect(() => fsm.assertCanStart(false)).not.toThrow();
    });

    it('rejects start when a session is already open', () => {
      expect(() => fsm.assertCanStart(true)).toThrow(InvalidSessionTransitionError);
    });

    it('returns scene_pick as the phase after start', () => {
      expect(fsm.nextPhaseAfterStart()).toBe('scene_pick');
    });
  });

  describe('selectScene', () => {
    it('allows selectScene from scene_pick', () => {
      expect(() => fsm.assertCanSelectScene('scene_pick')).not.toThrow();
    });

    it('rejects selectScene from capture_ready', () => {
      expect(() => fsm.assertCanSelectScene('capture_ready')).toThrow(
        InvalidSessionTransitionError,
      );
    });

    it('returns capture_ready as the phase after selectScene', () => {
      expect(fsm.nextPhaseAfterSelectScene()).toBe('capture_ready');
    });
  });

  describe('back', () => {
    it('allows back from capture_ready', () => {
      expect(() => fsm.assertCanGoBack('capture_ready')).not.toThrow();
    });

    it('rejects back from scene_pick', () => {
      expect(() => fsm.assertCanGoBack('scene_pick')).toThrow(
        InvalidSessionTransitionError,
      );
    });

    it('returns scene_pick as the phase after back', () => {
      expect(fsm.nextPhaseAfterBack()).toBe('scene_pick');
    });
  });
});
