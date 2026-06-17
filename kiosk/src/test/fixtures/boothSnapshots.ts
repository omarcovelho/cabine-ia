export const mockBoothSnapshot = {
  phase: 'attract' as const,
  event: { id: 'event-1', name: 'Default Event' },
  theme: { id: 'stub-a', name: 'Festa Cartoon' },
  scenes: [],
  config: { captureCountdownSeconds: 3, expectedFaceCount: 1 },
  session: null,
};

export const mockScenePickSnapshot = {
  phase: 'scene_pick' as const,
  event: { id: 'event-1', name: 'Default Event' },
  theme: { id: 'stub-a', name: 'Festa Cartoon' },
  scenes: [
    {
      id: 'beach',
      name: 'Praia',
      tagline: null,
      exampleUrl: '/themes/stub-a/scenes/beach/example',
    },
    {
      id: 'city',
      name: 'Cidade',
      tagline: null,
      exampleUrl: '/themes/stub-a/scenes/city/example',
    },
    {
      id: 'forest',
      name: 'Floresta',
      tagline: null,
      exampleUrl: '/themes/stub-a/scenes/forest/example',
    },
  ],
  config: { captureCountdownSeconds: 3, expectedFaceCount: 1 },
  session: { id: 'session-1', sceneId: null, sceneName: null },
};

export const mockCaptureReadySnapshot = {
  phase: 'capture_ready' as const,
  event: { id: 'event-1', name: 'Default Event' },
  theme: { id: 'stub-a', name: 'Festa Cartoon' },
  scenes: mockScenePickSnapshot.scenes,
  config: { captureCountdownSeconds: 3, expectedFaceCount: 1 },
  session: { id: 'session-1', sceneId: 'beach', sceneName: 'Praia' },
};

export const mockProcessingSnapshot = {
  phase: 'processing' as const,
  event: { id: 'event-1', name: 'Default Event' },
  theme: { id: 'stub-a', name: 'Festa Cartoon' },
  scenes: mockScenePickSnapshot.scenes,
  config: { captureCountdownSeconds: 3, expectedFaceCount: 1 },
  session: { id: 'session-1', sceneId: 'beach', sceneName: 'Praia' },
};
