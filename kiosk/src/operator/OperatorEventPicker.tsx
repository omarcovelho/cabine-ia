import { useCallback, useEffect, useState } from 'react';
import {
  activateEvent,
  createEvent,
  listEvents,
  OperatorAuthError,
  type OperatorEventSummary,
} from '../api/operatorClient';

type OperatorEventPickerProps = {
  token: string;
  onContinue: () => void;
  onConfigChanged: () => void;
};

export function OperatorEventPicker({
  token,
  onContinue,
  onConfigChanged,
}: OperatorEventPickerProps) {
  const [events, setEvents] = useState<OperatorEventSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reloadEvents = useCallback(async () => {
    const response = await listEvents(token);
    setEvents(response.events);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    void listEvents(token)
      .then((response) => {
        if (!cancelled) {
          setEvents(response.events);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Erro ao carregar eventos.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const hasActiveEvent = events.some((event) => event.isActive);

  return (
    <div className="operator-panel">
      <h2>Evento</h2>
      <ul className="operator-list">
        {events.map((event) => (
          <li key={event.id}>
            <span>
              {event.name}
              {event.isActive ? ' (ativo)' : ''}
            </span>
            {!event.isActive ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setError(null);
                  void activateEvent(token, event.id)
                    .then(async () => {
                      await reloadEvents();
                      onConfigChanged();
                    })
                    .catch((err: unknown) => {
                      if (err instanceof OperatorAuthError && err.status === 409) {
                        setError('Aguarde o convidado terminar a sessão atual.');
                        return;
                      }
                      setError('Erro ao ativar evento.');
                    });
                }}
              >
                Ativar
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <form
        className="operator-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const name = new FormData(form).get('name');
          if (typeof name !== 'string' || name.trim().length === 0) {
            return;
          }

          setError(null);
          void createEvent(token, name.trim())
            .then(async () => {
              form.reset();
              await reloadEvents();
            })
            .catch(() => {
              setError('Erro ao criar evento.');
            });
        }}
      >
        <label htmlFor="event-name">Novo evento</label>
        <input id="event-name" name="name" type="text" />
        <button type="submit" className="secondary-button">
          Criar
        </button>
      </form>
      {error ? <p className="operator-error">{error}</p> : null}
      <button
        type="button"
        className="primary-button"
        disabled={!hasActiveEvent}
        onClick={onContinue}
      >
        Escolher tema
      </button>
    </div>
  );
}
