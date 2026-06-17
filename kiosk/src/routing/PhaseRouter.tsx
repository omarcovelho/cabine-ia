import type { BoothSnapshot } from '../types/booth';
import { AttractScreen } from '../screens/AttractScreen';
import { CaptureReadyScreen } from '../screens/CaptureReadyScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ScenePickerScreen } from '../screens/ScenePickerScreen';

type PhaseRouterProps = {
  snapshot: BoothSnapshot | undefined;
  onStartSession: () => void;
  onSelectScene: (sceneId: string) => void;
  onBack: () => void;
  onSubmitCapture: (crops: Blob[]) => void;
  onOperatorEntry: () => void;
  isGuestActionPending?: boolean;
};

export function PhaseRouter({
  snapshot,
  onStartSession,
  onSelectScene,
  onBack,
  onSubmitCapture,
  onOperatorEntry,
  isGuestActionPending = false,
}: PhaseRouterProps) {
  if (snapshot === undefined) {
    return null;
  }

  switch (snapshot.phase) {
    case 'attract':
      return (
        <AttractScreen
          onStart={onStartSession}
          onOperatorEntry={onOperatorEntry}
          isStarting={isGuestActionPending}
        />
      );
    case 'scene_pick':
      return (
        <ScenePickerScreen
          scenes={snapshot.scenes}
          onSelectScene={onSelectScene}
          isSelecting={isGuestActionPending}
        />
      );
    case 'capture_ready':
      return (
        <CaptureReadyScreen
          sceneName={snapshot.session?.sceneName ?? ''}
          captureCountdownSeconds={snapshot.config.captureCountdownSeconds}
          expectedFaceCount={snapshot.config.expectedFaceCount}
          onBack={onBack}
          onSubmitCapture={onSubmitCapture}
          isBusy={isGuestActionPending}
        />
      );
    case 'processing':
      return <ProcessingScreen />;
    default:
      return null;
  }
}
