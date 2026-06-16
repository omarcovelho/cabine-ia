import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttractScreen } from './AttractScreen';

describe('AttractScreen', () => {
  it('renders PT headline and Começar button', () => {
    render(
      <AttractScreen onStart={vi.fn()} onOperatorEntry={vi.fn()} />,
    );
    expect(screen.getByText('Faça seu retrato cartoon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument();
  });

  it('calls onStart when Começar is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(
      <AttractScreen onStart={onStart} onOperatorEntry={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Começar' }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('has hidden operator entry zone', () => {
    render(
      <AttractScreen onStart={vi.fn()} onOperatorEntry={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: 'Entrada do operador' }),
    ).toBeInTheDocument();
  });
});
