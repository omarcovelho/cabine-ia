import type { OperatorEventSummary } from '../api/operatorClient';

type OperatorEventPickerProps = {
  events: OperatorEventSummary[];
  onCreateEvent: (name: string) => Promise<void>;
  onActivateEvent: (eventId: string) => Promise<void>;
  onContinue: () => void;
  error?: string | null;
};

export function OperatorEventPicker({
  events,
  onCreateEvent,
  onActivateEvent,
  onContinue,
  error,
}: OperatorEventPickerProps) {
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
                onClick={() => onActivateEvent(event.id)}
              >
                Ativar
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <form
        className="operator-create-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const name = new FormData(form).get('name');
          if (typeof name === 'string' && name.trim().length > 0) {
            await onCreateEvent(name.trim());
            form.reset();
          }
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
