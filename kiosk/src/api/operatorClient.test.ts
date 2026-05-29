import { afterEach, describe, expect, it, vi } from 'vitest';
import { login, OperatorAuthError } from './operatorClient';

describe('operatorClient.login', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses token response from operator login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'jwt-token', expiresIn: 86400 }),
      }),
    );

    const result = await login('1234');
    expect(result).toEqual({ token: 'jwt-token', expiresIn: 86400 });
  });

  it('throws with status 401 for invalid pin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    await expect(login('wrong')).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof OperatorAuthError && error.status === 401,
    );
  });
});
