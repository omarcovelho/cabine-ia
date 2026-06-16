import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthHeaders, login as loginRequest } from '../api/operatorClient';
import {
  clearOperatorToken,
  getOperatorToken,
  setOperatorToken,
} from './operatorAuthStorage';
import { useOperatorAuth } from './useOperatorAuth';

vi.mock('../api/operatorClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/operatorClient')>();
  return {
    ...actual,
    login: vi.fn(),
  };
});

describe('useOperatorAuth', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(loginRequest).mockResolvedValue({
      token: 'jwt-token',
      expiresIn: 86400,
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('stores token after login and exposes auth headers', async () => {
    const { result } = renderHook(() => useOperatorAuth());

    await act(async () => {
      await result.current.login('1234');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('jwt-token');
    expect(result.current.getAuthHeaders()).toEqual({
      Authorization: 'Bearer jwt-token',
    });
    expect(getOperatorToken()).toBe('jwt-token');
  });

  it('clears token on logout', async () => {
    setOperatorToken('existing-token');
    const { result } = renderHook(() => useOperatorAuth());

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(getOperatorToken()).toBeNull();
    expect(getAuthHeaders(null)).toEqual({});
  });

  it('restores token from sessionStorage on mount', () => {
    setOperatorToken('stored-token');
    const { result } = renderHook(() => useOperatorAuth());

    expect(result.current.token).toBe('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});

describe('operatorAuthStorage', () => {
  afterEach(() => {
    clearOperatorToken();
  });

  it('round-trips token in sessionStorage', () => {
    setOperatorToken('abc');
    expect(getOperatorToken()).toBe('abc');
    clearOperatorToken();
    expect(getOperatorToken()).toBeNull();
  });
});
