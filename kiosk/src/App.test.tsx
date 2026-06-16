import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockBoothSnapshot } from './test/fixtures/boothSnapshots';
import App from './App';

vi.mock('./hooks/useBoothPolling', () => ({
  useBoothPolling: vi.fn(() => ({
    snapshot: mockBoothSnapshot,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('./auth/useOperatorAuth', () => ({
  useOperatorAuth: vi.fn(() => ({
    token: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    getAuthHeaders: vi.fn(() => ({})),
  })),
}));

describe('App', () => {
  it('renders attract headline from booth polling', () => {
    render(<App />);
    expect(screen.getByText(/Faça seu retrato cartoon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument();
  });
});
