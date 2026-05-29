export type OperatorLoginResponse = {
  token: string;
  expiresIn: number;
};

export const OPERATOR_LOGIN_URL = '/api/operator/login';

export class OperatorAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function login(pin: string): Promise<OperatorLoginResponse> {
  const response = await fetch(OPERATOR_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });

  if (!response.ok) {
    throw new OperatorAuthError(
      response.status,
      `Operator login failed: ${response.status}`,
    );
  }

  return response.json() as Promise<OperatorLoginResponse>;
}

export function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}
