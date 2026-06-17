import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProcessingScreen } from './ProcessingScreen';

describe('ProcessingScreen', () => {
  it('shows processing message', () => {
    render(<ProcessingScreen />);
    expect(screen.getByText('Criando seu retrato…')).toBeInTheDocument();
  });
});
