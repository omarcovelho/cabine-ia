import type { OperatorThemeSummary } from '../api/operatorClient';

type OperatorThemePickerProps = {
  themes: OperatorThemeSummary[];
  activeThemeId: string | null;
  onSelectTheme: (themeId: string) => Promise<void>;
  error?: string | null;
};

export function OperatorThemePicker({
  themes,
  activeThemeId,
  onSelectTheme,
  error,
}: OperatorThemePickerProps) {
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
                onClick={() => onSelectTheme(theme.id)}
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
