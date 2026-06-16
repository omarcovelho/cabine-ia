export type SessionDto = {
  id: string;
  phase: string;
  sceneId: string | null;
  eventId: string;
};

type SessionResponse = {
  session: SessionDto;
};

export async function startSession(): Promise<SessionDto> {
  const response = await fetch('/api/sessions/start', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.status}`);
  }
  const body = (await response.json()) as SessionResponse;
  return body.session;
}

export async function selectScene(sceneId: string): Promise<SessionDto> {
  const response = await fetch('/api/sessions/current/scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to select scene: ${response.status}`);
  }
  const body = (await response.json()) as SessionResponse;
  return body.session;
}

export async function goBack(): Promise<SessionDto> {
  const response = await fetch('/api/sessions/current/back', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to go back: ${response.status}`);
  }
  const body = (await response.json()) as SessionResponse;
  return body.session;
}
