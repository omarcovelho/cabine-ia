import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhaseRouter } from './PhaseRouter';

describe('PhaseRouter', () => {
  it('renders AttractScreen when phase is attract', () => {
    render(<PhaseRouter phase="attract" />);
    expect(screen.getByText(/Faça seu retrato cartoon/i)).toBeInTheDocument();
  });

  it('renders nothing while phase is undefined', () => {
    const { container } = render(<PhaseRouter phase={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
