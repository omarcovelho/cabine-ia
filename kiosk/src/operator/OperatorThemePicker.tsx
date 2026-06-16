import { useEffect, useState } from 'react';
import {
  listThemes,
  OperatorAuthError,
  setTheme,
  type OperatorThemeSummary,
} from '../api/operatorClient';

type OperatorThemePickerProps = {
  token: string;
  activeThemeId: string | null;
  onConfigChanged: () => void;
  onClose: () => void;
};

export function OperatorThemePicker({
  token,
  activeThemeId,
  onConfigChanged,
  onClose,
}: OperatorThemePickerProps) {
  const [themes, setThemes] = useState<OperatorThemeSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void listThemes(token)
      .then((response) => {
        if (!cancelled) {
          setThemes(response.themes);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Erro ao carregar temas.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="operator-panel">
      <h2>Tema</h2>
      <ul className="operator-list">
        {themes.map((theme) => (
          <li key={theme.id}>
            <span>
              {theme.name}
              {theme.id === activeThemeId ? ' (ativo)' : ''}
            </span>
            {theme.id !== activeThemeId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setError(null);
                  void setTheme(token, theme.id)
                    .then(() => {
                      onConfigChanged();
                      onClose();
                    })
                    .catch((err: unknown) => {
                      if (err instanceof OperatorAuthError && err.status === 409) {
                        setError('Aguarde o convidado terminar a sessão atual.');
                        return;
                      }
                      setError('Erro ao selecionar tema.');
                    });
                }}
              >
                Selecionar
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {error ? <p className="operator-error">{error}</p> : null}
    </div>
  );
}
