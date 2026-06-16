type CaptureReadyScreenProps = {
  sceneName: string;
  onBack: () => void;
  isBusy?: boolean;
};

export function CaptureReadyScreen({
  sceneName,
  onBack,
  isBusy = false,
}: CaptureReadyScreenProps) {
  return (
    <main className="capture-ready-screen">
      <p className="scene-label">Cena: {sceneName}</p>
      <button type="button" className="primary-button" disabled>
        Tirar foto
      </button>
      <button
        type="button"
        className="secondary-button"
        onClick={onBack}
        disabled={isBusy}
      >
        Voltar
      </button>
    </main>
  );
}
