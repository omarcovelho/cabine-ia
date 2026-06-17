import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FaceDetector } from '../camera/useFaceDetection';
import { CaptureReadyScreen } from './CaptureReadyScreen';

const mockStream = {
  getTracks: () => [{ stop: vi.fn() }],
} as unknown as MediaStream;
const mockStart = vi.fn().mockResolvedValue(mockStream);
const mockStop = vi.fn();

vi.mock('../camera/useCamera', () => ({
  useCamera: () => ({
    stream: mockStream,
    error: null,
    start: mockStart,
    stop: mockStop,
  }),
}));

vi.mock('../camera/captureVideoFrame', () => ({
  captureVideoFrame: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    return canvas;
  },
}));

vi.mock('../camera/extractFaceCrops', () => ({
  extractFaceCrops: vi.fn().mockResolvedValue([
    new Blob(['crop'], { type: 'image/jpeg' }),
  ]),
}));

describe('CaptureReadyScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStart.mockClear();
    mockStop.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const faceDetector: FaceDetector = {
    detect: vi.fn().mockResolvedValue({
      faces: [{ x: 0, y: 0, width: 100, height: 120 }],
    }),
  };

  it('shows enabled Tirar foto in ready mode', () => {
    render(
      <CaptureReadyScreen
        sceneName="Praia"
        captureCountdownSeconds={3}
        expectedFaceCount={1}
        onBack={vi.fn()}
        onSubmitCapture={vi.fn()}
        faceDetector={faceDetector}
      />,
    );

    expect(screen.getByText('Cena: Praia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeEnabled();
  });

  it('shows consent copy after Tirar foto and submits capture after countdown', async () => {
    const user = userEvent.setup();
    const onSubmitCapture = vi.fn().mockResolvedValue(undefined);

    render(
      <CaptureReadyScreen
        sceneName="Praia"
        captureCountdownSeconds={1}
        expectedFaceCount={1}
        onBack={vi.fn()}
        onSubmitCapture={onSubmitCapture}
        faceDetector={faceDetector}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tirar foto' }));
    expect(
      screen.getByText(
        'Usamos sua foto só para criar o retrato cartoon e entregar o arquivo digital.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(mockStart).toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await Promise.resolve();
    });

    expect(onSubmitCapture).toHaveBeenCalledWith([expect.any(Blob)]);
  });

  it('disables Voltar while capture mode is active', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <CaptureReadyScreen
        sceneName="Praia"
        captureCountdownSeconds={3}
        expectedFaceCount={1}
        onBack={onBack}
        onSubmitCapture={vi.fn()}
        faceDetector={faceDetector}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tirar foto' }));
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('shows retry copy when no faces are detected', async () => {
    const user = userEvent.setup();
    const emptyDetector: FaceDetector = {
      detect: vi.fn().mockResolvedValue({ faces: [] }),
    };

    render(
      <CaptureReadyScreen
        sceneName="Praia"
        captureCountdownSeconds={1}
        expectedFaceCount={1}
        onBack={vi.fn()}
        onSubmitCapture={vi.fn()}
        faceDetector={emptyDetector}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tirar foto' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(
      screen.getByText('Não encontramos rostos. Tente de novo.'),
    ).toBeInTheDocument();
  });

  it('shows mismatch retry copy when detected count differs from expected', async () => {
    const user = userEvent.setup();
    const mismatchDetector: FaceDetector = {
      detect: vi.fn().mockResolvedValue({
        faces: [
          { x: 0, y: 0, width: 50, height: 50 },
          { x: 60, y: 0, width: 50, height: 50 },
        ],
      }),
    };

    render(
      <CaptureReadyScreen
        sceneName="Praia"
        captureCountdownSeconds={1}
        expectedFaceCount={1}
        onBack={vi.fn()}
        onSubmitCapture={vi.fn()}
        faceDetector={mismatchDetector}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Tirar foto' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(
      screen.getByText(
        'Encontramos 2 rosto(s). Esperávamos 1. Ajuste o enquadramento.',
      ),
    ).toBeInTheDocument();
  });
});
