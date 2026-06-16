import { useState } from 'react';
import { OperatorEventPicker } from './OperatorEventPicker';
import { OperatorLogin } from './OperatorLogin';
import { OperatorThemePicker } from './OperatorThemePicker';

type OperatorOverlayProps = {
  isOpen: boolean;
  token: string | null;
  isAuthenticated: boolean;
  activeThemeId: string | null;
  onLogin: (pin: string) => Promise<unknown>;
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
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

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
            token={token}
            onContinue={() => {
              setError(null);
              setStep('themes');
            }}
            onConfigChanged={onConfigChanged}
          />
        ) : null}
        {step === 'themes' && token ? (
          <OperatorThemePicker
            token={token}
            activeThemeId={activeThemeId}
            onConfigChanged={onConfigChanged}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}
