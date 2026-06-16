export type OperatorLoginResponse = {
  token: string;
  expiresIn: number;
};

export type OperatorThemeSummary = {
  id: string;
  name: string;
};

export type OperatorEventSummary = {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
};

export const OPERATOR_LOGIN_URL = '/api/operator/login';

export class OperatorAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

async function operatorRequest<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/operator${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new OperatorAuthError(
      response.status,
      `Operator request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
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

export async function listThemes(
  token: string,
): Promise<{ themes: OperatorThemeSummary[] }> {
  return operatorRequest(token, '/themes');
}

export async function setTheme(
  token: string,
  themeId: string,
): Promise<{ theme: OperatorThemeSummary }> {
  return operatorRequest(token, '/theme', {
    method: 'POST',
    body: JSON.stringify({ themeId }),
  });
}

export async function listEvents(
  token: string,
): Promise<{ events: OperatorEventSummary[] }> {
  return operatorRequest(token, '/events');
}

export async function createEvent(
  token: string,
  name: string,
): Promise<{ event: OperatorEventSummary }> {
  return operatorRequest(token, '/events', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function activateEvent(
  token: string,
  eventId: string,
): Promise<{ event: OperatorEventSummary }> {
  return operatorRequest(token, `/events/${eventId}/activate`, {
    method: 'POST',
  });
}
