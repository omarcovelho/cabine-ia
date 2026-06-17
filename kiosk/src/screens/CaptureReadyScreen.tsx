import { useCallback, useEffect, useRef, useState } from 'react';
import { getCaptureRetryMessage } from '../camera/captureValidation';
import { captureVideoFrame } from '../camera/captureVideoFrame';
import { createMediaPipeFaceDetector } from '../camera/createMediaPipeFaceDetector';
import { extractFaceCrops } from '../camera/extractFaceCrops';
import type { FaceDetector } from '../camera/useFaceDetection';
import { useFaceDetection } from '../camera/useFaceDetection';
import { useCamera } from '../camera/useCamera';

const CONSENT_COPY =
  'Usamos sua foto só para criar o retrato cartoon e entregar o arquivo digital.';

const noopFaceDetector: FaceDetector = {
  detect: async () => ({ faces: [] }),
};

export type CaptureReadyScreenProps = {
  sceneName: string;
  captureCountdownSeconds: number;
  expectedFaceCount: number;
  onBack: () => void;
  onSubmitCapture: (crops: Blob[]) => void | Promise<void>;
  isBusy?: boolean;
  faceDetector?: FaceDetector;
};

type UiMode = 'ready' | 'capturing';
type CaptureStep = 'consent' | 'preview';

export function CaptureReadyScreen({
  sceneName,
  captureCountdownSeconds,
  expectedFaceCount,
  onBack,
  onSubmitCapture,
  isBusy = false,
  faceDetector,
}: CaptureReadyScreenProps) {
  const [uiMode, setUiMode] = useState<UiMode>('ready');
  const [captureStep, setCaptureStep] = useState<CaptureStep>('consent');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [loadedDetector, setLoadedDetector] = useState<FaceDetector | null>(
    faceDetector ?? null,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, start, stop } = useCamera();
  const activeDetector = faceDetector ?? loadedDetector ?? noopFaceDetector;
  const { detect } = useFaceDetection(activeDetector);

  useEffect(() => {
    if (faceDetector || uiMode !== 'capturing') {
      return;
    }

    let cancelled = false;
    void createMediaPipeFaceDetector().then((detector) => {
      if (!cancelled) {
        setLoadedDetector(detector);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [faceDetector, uiMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      return;
    }

    video.srcObject = stream;
    void video.play();
  }, [stream]);

  useEffect(() => {
    if (uiMode !== 'capturing') {
      stop();
    }
  }, [stop, uiMode]);

  const resetCaptureAttempt = useCallback(() => {
    setRetryMessage(null);
    setCountdown(captureCountdownSeconds);
  }, [captureCountdownSeconds]);

  const runCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const frame = captureVideoFrame(video);
    const faces = await detect(frame, frame.width, frame.height);
    const retry = getCaptureRetryMessage(faces.length, expectedFaceCount);
    if (retry) {
      setRetryMessage(retry);
      setCountdown(null);
      return;
    }

    const crops = await extractFaceCrops(frame, frame.width, frame.height, faces);
    await onSubmitCapture(crops);
  }, [detect, expectedFaceCount, onSubmitCapture]);

  useEffect(() => {
    if (
      uiMode !== 'capturing' ||
      captureStep !== 'preview' ||
      !stream ||
      countdown !== null ||
      retryMessage !== null
    ) {
      return;
    }

    setCountdown(captureCountdownSeconds);
  }, [
    captureCountdownSeconds,
    captureStep,
    countdown,
    retryMessage,
    stream,
    uiMode,
  ]);

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    if (countdown === 0) {
      void runCapture().finally(() => {
        setCountdown(null);
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, runCapture]);

  const beginCapture = () => {
    setUiMode('capturing');
    setCaptureStep('consent');
    setRetryMessage(null);
    setCountdown(null);
  };

  const acceptConsent = () => {
    setCaptureStep('preview');
    void start();
  };

  const exitCapture = () => {
    stop();
    setUiMode('ready');
    setCaptureStep('consent');
    setRetryMessage(null);
    setCountdown(null);
  };

  if (uiMode === 'ready') {
    return (
      <main className="capture-ready-screen">
        <p className="scene-label">Cena: {sceneName}</p>
        <button
          type="button"
          className="primary-button"
          onClick={beginCapture}
          disabled={isBusy}
        >
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

  if (captureStep === 'consent') {
    return (
      <main className="capture-ready-screen capture-mode">
        <p className="consent-copy">{CONSENT_COPY}</p>
        <button
          type="button"
          className="primary-button"
          onClick={acceptConsent}
          disabled={isBusy}
        >
          Continuar
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={exitCapture}
          disabled={isBusy}
        >
          Cancelar
        </button>
      </main>
    );
  }

  return (
    <main className="capture-ready-screen capture-mode">
      <div className="camera-preview">
        <video ref={videoRef} autoPlay playsInline muted />
        {countdown !== null && countdown > 0 ? (
          <p className="countdown-label">{countdown}</p>
        ) : null}
      </div>
      {retryMessage ? <p className="retry-message">{retryMessage}</p> : null}
      {retryMessage ? (
        <button
          type="button"
          className="primary-button"
          onClick={resetCaptureAttempt}
          disabled={isBusy}
        >
          Tentar de novo
        </button>
      ) : null}
      <button
        type="button"
        className="secondary-button"
        onClick={exitCapture}
        disabled={isBusy || countdown !== null}
      >
        Cancelar
      </button>
    </main>
  );
}
