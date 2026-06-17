import { useCallback, useState } from 'react';
import { goBack, selectScene, startSession, submitCapture } from './api/sessionClient';
import { useOperatorAuth } from './auth/useOperatorAuth';
import { useBoothPolling } from './hooks/useBoothPolling';
import { OperatorOverlay } from './operator/OperatorOverlay';
import { PhaseRouter } from './routing/PhaseRouter';
import './App.css';

function App() {
  const { snapshot, error, refetch } = useBoothPolling();
  const { login, token, isAuthenticated } = useOperatorAuth();
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [isGuestActionPending, setIsGuestActionPending] = useState(false);

  const runGuestAction = useCallback(
    async (action: () => Promise<unknown>) => {
      setIsGuestActionPending(true);
      try {
        await action();
        await refetch();
      } finally {
        setIsGuestActionPending(false);
      }
    },
    [refetch],
  );

  if (error) {
    return <main className="app-error">Erro ao conectar com a cabine.</main>;
  }

  if (!snapshot) {
    return <main className="app-loading">Conectando...</main>;
  }

  return (
    <>
      <PhaseRouter
        snapshot={snapshot}
        isGuestActionPending={isGuestActionPending}
        onOperatorEntry={() => setIsOperatorOpen(true)}
        onStartSession={() => {
          void runGuestAction(startSession);
        }}
        onSelectScene={(sceneId) => {
          void runGuestAction(() => selectScene(sceneId));
        }}
        onBack={() => {
          void runGuestAction(goBack);
        }}
        onSubmitCapture={(crops) => {
          void runGuestAction(() => submitCapture(crops));
        }}
      />
      <OperatorOverlay
        key={isOperatorOpen ? 'open' : 'closed'}
        isOpen={isOperatorOpen}
        token={token}
        isAuthenticated={isAuthenticated}
        activeThemeId={snapshot?.theme.id ?? null}
        onLogin={login}
        onClose={() => setIsOperatorOpen(false)}
        onConfigChanged={() => {
          void refetch();
        }}
      />
    </>
  );
}

export default App;
