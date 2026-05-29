import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AttractScreen } from './AttractScreen';

describe('AttractScreen', () => {
  it('renders PT headline', () => {
    render(<AttractScreen />);
    expect(screen.getByText('Faça seu retrato cartoon')).toBeInTheDocument();
  });

  it('has fullscreen attract-screen class', () => {
    render(<AttractScreen />);
    expect(document.querySelector('.attract-screen')).toBeInTheDocument();
  });
});
