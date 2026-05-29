export const OPERATOR_TOKEN_KEY = 'cabine.operatorToken';

export function getOperatorToken(): string | null {
  return sessionStorage.getItem(OPERATOR_TOKEN_KEY);
}

export function setOperatorToken(token: string): void {
  sessionStorage.setItem(OPERATOR_TOKEN_KEY, token);
}

export function clearOperatorToken(): void {
  sessionStorage.removeItem(OPERATOR_TOKEN_KEY);
}
