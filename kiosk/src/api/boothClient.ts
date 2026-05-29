import type { BoothSnapshot } from '../types/booth';

export const BOOTH_URL = '/api/booth';

export async function fetchBooth(): Promise<BoothSnapshot> {
  const response = await fetch(BOOTH_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch booth: ${response.status}`);
  }
  return response.json() as Promise<BoothSnapshot>;
}
