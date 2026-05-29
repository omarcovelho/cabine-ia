import type { BoothPhase } from '../types/booth';
import { AttractScreen } from '../screens/AttractScreen';

type PhaseRouterProps = {
  phase: BoothPhase | undefined;
};

export function PhaseRouter({ phase }: PhaseRouterProps) {
  if (phase === undefined) {
    return null;
  }

  switch (phase) {
    case 'attract':
      return <AttractScreen />;
    default:
      return null;
  }
}
