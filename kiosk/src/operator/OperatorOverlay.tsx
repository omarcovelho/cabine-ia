import { useCallback, useEffect, useState } from 'react';
import {
  activateEvent,
  createEvent,
  listEvents,
  listThemes,
  OperatorAuthError,
  setTheme,
  type OperatorEventSummary,
  type OperatorThemeSummary,
} from '../api/operatorClient';
import { OperatorEventPicker } from './OperatorEventPicker';
import { OperatorLogin } from './OperatorLogin';
import { OperatorThemePicker } from './OperatorThemePicker';

type OperatorOverlayProps = {
  isOpen: boolean;
  token: string | null;
  isAuthenticated: boolean;
  activeThemeId: string | null;
  onLogin: (pin: string) => Promise<void>;
  onClose: () => void;
  onConfigChanged: () => void;
};

type OperatorStep = 'login' | 'events' | 'themes';

export function OperatorOverlay({
  isOpen,
  token,
  isAuthenticated,
  activeThemeId,
  onLogin,
  onClose,
  onConfigChanged,
}: OperatorOverlayProps) {
  const [step, setStep] = useState<OperatorStep>(
    isAuthenticated ? 'events' : 'login',
  );
  const [events, setEvents] = useState<OperatorEventSummary[]>([]);
  const [themes, setThemes] = useState<OperatorThemeSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!token) {
      return;
    }
    const response = await listEvents(token);
    setEvents(response.events);
  }, [token]);

  const loadThemes = useCallback(async () => {
    if (!token) {
      return;
    }
    const response = await listThemes(token);
    setThemes(response.themes);
  }, [token]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setStep(isAuthenticated ? 'events' : 'login');
    setError(null);
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !token) {
      return;
    }
    void loadEvents().catch(() => setError('Erro ao carregar eventos.'));
  }, [isOpen, isAuthenticated, token, loadEvents]);

  useEffect(() => {
    if (!isOpen || step !== 'themes' || !token) {
      return;
    }
    void loadThemes().catch(() => setError('Erro ao carregar temas.'));
  }, [isOpen, step, token, loadThemes]);

  if (!isOpen) {
    return null;
  }

  const handleOperatorError = (err: unknown, fallback: string) => {
    if (err instanceof OperatorAuthError && err.status === 409) {
      setError('Aguarde o convidado terminar a sessão atual.');
      return;
    }
    setError(fallback);
  };

  return (
    <div className="operator-overlay" role="dialog" aria-modal="true">
      <div className="operator-overlay-content">
        <button
          type="button"
          className="operator-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
        {step === 'login' ? (
          <OperatorLogin
            error={error}
            onLogin={async (pin) => {
              setError(null);
              try {
                await onLogin(pin);
                setStep('events');
              } catch {
                setError('PIN inválido.');
              }
            }}
          />
        ) : null}
        {step === 'events' && token ? (
          <OperatorEventPicker
            events={events}
            error={error}
            onCreateEvent={async (name) => {
              setError(null);
              try {
                await createEvent(token, name);
                await loadEvents();
              } catch {
                setError('Erro ao criar evento.');
              }
            }}
            onActivateEvent={async (eventId) => {
              setError(null);
              try {
                await activateEvent(token, eventId);
                await loadEvents();
                onConfigChanged();
              } catch (err) {
                handleOperatorError(err, 'Erro ao ativar evento.');
              }
            }}
            onContinue={() => {
              setError(null);
              setStep('themes');
            }}
          />
        ) : null}
        {step === 'themes' && token ? (
          <OperatorThemePicker
            themes={themes}
            activeThemeId={activeThemeId}
            error={error}
            onSelectTheme={async (themeId) => {
              setError(null);
              try {
                await setTheme(token, themeId);
                onConfigChanged();
                onClose();
              } catch (err) {
                handleOperatorError(err, 'Erro ao selecionar tema.');
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
