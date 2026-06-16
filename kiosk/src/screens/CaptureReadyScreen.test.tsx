import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaptureReadyScreen } from './CaptureReadyScreen';

describe('CaptureReadyScreen', () => {
  it('shows scene name and Tirar foto stub', () => {
    render(
      <CaptureReadyScreen sceneName="Praia" onBack={vi.fn()} />,
    );

    expect(screen.getByText('Cena: Praia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeDisabled();
  });

  it('calls onBack when Voltar is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <CaptureReadyScreen sceneName="Praia" onBack={onBack} />,
    );

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
