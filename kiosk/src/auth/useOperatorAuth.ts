import { useCallback, useMemo, useState } from 'react';
import { getAuthHeaders, login as loginRequest } from '../api/operatorClient';
import {
  clearOperatorToken,
  getOperatorToken,
  setOperatorToken,
} from './operatorAuthStorage';

export function useOperatorAuth() {
  const [token, setToken] = useState<string | null>(() => getOperatorToken());

  const login = useCallback(async (pin: string) => {
    const response = await loginRequest(pin);
    setOperatorToken(response.token);
    setToken(response.token);
    return response;
  }, []);

  const logout = useCallback(() => {
    clearOperatorToken();
    setToken(null);
  }, []);

  const isAuthenticated = token !== null;

  const authHeaders = useMemo(() => getAuthHeaders(token), [token]);

  return {
    token,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders: () => authHeaders,
  };
}
