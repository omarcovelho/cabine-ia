type AttractScreenProps = {
  onStart: () => void;
  onOperatorEntry: () => void;
  isStarting?: boolean;
};

export function AttractScreen({
  onStart,
  onOperatorEntry,
  isStarting = false,
}: AttractScreenProps) {
  return (
    <main className="attract-screen">
      <button
        type="button"
        className="operator-entry-zone"
        aria-label="Entrada do operador"
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          const target = event.currentTarget;
          const timer = window.setTimeout(() => {
            target.dataset.longPressTriggered = 'true';
            onOperatorEntry();
          }, 2000);

          const clear = () => {
            window.clearTimeout(timer);
            target.removeEventListener('pointerup', clear);
            target.removeEventListener('pointerleave', clear);
            target.removeEventListener('pointercancel', clear);
          };

          target.addEventListener('pointerup', clear);
          target.addEventListener('pointerleave', clear);
          target.addEventListener('pointercancel', clear);
        }}
        onClick={(event) => {
          if (event.currentTarget.dataset.longPressTriggered === 'true') {
            event.currentTarget.dataset.longPressTriggered = 'false';
          }
        }}
      />
      <h1>Faça seu retrato cartoon</h1>
      <button
        type="button"
        className="primary-button"
        onClick={onStart}
        disabled={isStarting}
      >
        Começar
      </button>
    </main>
  );
}
