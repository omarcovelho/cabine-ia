import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as operatorClient from '../api/operatorClient';
import { OperatorOverlay } from './OperatorOverlay';

vi.mock('../api/operatorClient', async (importOriginal) => {
  const actual = await importOriginal<typeof operatorClient>();
  return {
    ...actual,
    listEvents: vi.fn(),
    listThemes: vi.fn(),
    createEvent: vi.fn(),
    activateEvent: vi.fn(),
    setTheme: vi.fn(),
  };
});

describe('OperatorOverlay', () => {
  it('shows login when not authenticated', () => {
    render(
      <OperatorOverlay
        isOpen
        token={null}
        isAuthenticated={false}
        activeThemeId={null}
        onLogin={vi.fn()}
        onClose={vi.fn()}
        onConfigChanged={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Operador' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('shows event picker after login and loads events', async () => {
    vi.mocked(operatorClient.listEvents).mockResolvedValue({
      events: [
        { id: 'e1', name: 'Festa', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    });

    render(
      <OperatorOverlay
        isOpen
        token="jwt"
        isAuthenticated
        activeThemeId="stub-a"
        onLogin={vi.fn()}
        onClose={vi.fn()}
        onConfigChanged={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Festa (ativo)')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Escolher tema' })).toBeEnabled();
  });

  it('moves to theme picker after Escolher tema', async () => {
    const user = userEvent.setup();
    vi.mocked(operatorClient.listEvents).mockResolvedValue({
      events: [
        { id: 'e1', name: 'Festa', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    });
    vi.mocked(operatorClient.listThemes).mockResolvedValue({
      themes: [{ id: 'stub-a', name: 'Cartoon' }],
    });

    render(
      <OperatorOverlay
        isOpen
        token="jwt"
        isAuthenticated
        activeThemeId="stub-a"
        onLogin={vi.fn()}
        onClose={vi.fn()}
        onConfigChanged={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Escolher tema' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'Escolher tema' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tema' })).toBeInTheDocument();
    });
    expect(screen.getByText('Cartoon (ativo)')).toBeInTheDocument();
  });

  it('calls setTheme and onConfigChanged when selecting a theme', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfigChanged = vi.fn();

    vi.mocked(operatorClient.listEvents).mockResolvedValue({
      events: [
        { id: 'e1', name: 'Festa', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    });
    vi.mocked(operatorClient.listThemes).mockResolvedValue({
      themes: [
        { id: 'stub-a', name: 'Cartoon' },
        { id: 'stub-b', name: 'Outro' },
      ],
    });
    vi.mocked(operatorClient.setTheme).mockResolvedValue({
      theme: { id: 'stub-b', name: 'Outro' },
    });

    render(
      <OperatorOverlay
        isOpen
        token="jwt"
        isAuthenticated
        activeThemeId="stub-a"
        onLogin={vi.fn()}
        onClose={onClose}
        onConfigChanged={onConfigChanged}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Escolher tema' })).toBeEnabled();
    });
    await user.click(screen.getByRole('button', { name: 'Escolher tema' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Selecionar' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Selecionar' }));

    await waitFor(() => {
      expect(operatorClient.setTheme).toHaveBeenCalledWith('jwt', 'stub-b');
    });
    expect(onConfigChanged).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
