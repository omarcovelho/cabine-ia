import { Injectable } from '@nestjs/common';
import { SessionPhase } from './session.types';
import { InvalidSessionTransitionError } from './session-fsm.errors';

@Injectable()
export class SessionFsmService {
  assertCanStart(hasOpenSession: boolean): void {
    if (hasOpenSession) {
      throw new InvalidSessionTransitionError(
        'Cannot start a session while one is already open',
      );
    }
  }

  nextPhaseAfterStart(): SessionPhase {
    return 'scene_pick';
  }

  assertCanSelectScene(currentPhase: string): void {
    if (currentPhase !== 'scene_pick') {
      throw new InvalidSessionTransitionError(
        'Scene can only be selected during scene_pick',
      );
    }
  }

  nextPhaseAfterSelectScene(): SessionPhase {
    return 'capture_ready';
  }

  assertCanGoBack(currentPhase: string): void {
    if (currentPhase !== 'capture_ready') {
      throw new InvalidSessionTransitionError(
        'Back is only allowed during capture_ready',
      );
    }
  }

  nextPhaseAfterBack(): SessionPhase {
    return 'scene_pick';
  }
}
