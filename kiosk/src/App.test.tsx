import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

const mockSnapshot = {
  phase: 'attract' as const,
  theme: null,
  scenes: [],
  config: {},
  session: null,
};

vi.mock('./hooks/useBoothPolling', () => ({
  useBoothPolling: vi.fn(() => ({
    snapshot: mockSnapshot,
    error: null,
  })),
}));

describe('App', () => {
  it('renders attract headline from booth polling', () => {
    render(<App />);
    expect(screen.getByText(/Faça seu retrato cartoon/i)).toBeInTheDocument();
  });
});
