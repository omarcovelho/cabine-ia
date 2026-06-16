import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    service = new ThemeService();
  });

  it('lists stub-a and stub-b theme ids', () => {
    const ids = service.listThemeIds();
    expect(ids).toContain('stub-a');
    expect(ids).toContain('stub-b');
  });

  it('loads stub-a with three scenes and prompts from prompt.txt', () => {
    const pack = service.loadPack('stub-a');
    expect(pack.id).toBe('stub-a');
    expect(pack.name).toBe('Festa Cartoon');
    expect(pack.scenes).toHaveLength(3);
    expect(pack.scenes[0]?.prompt).toBe('stub prompt beach — server only');
  });

  it('returns scene prompt via getScenePrompt', () => {
    expect(service.getScenePrompt('stub-a', 'beach')).toBe(
      'stub prompt beach — server only',
    );
  });

  it('exposes guest-safe theme summary without prompts', () => {
    const pack = service.loadPack('stub-a');
    const summary = service.toThemeSummary(pack);
    expect(summary).toEqual({ id: 'stub-a', name: 'Festa Cartoon' });
    expect(summary).not.toHaveProperty('prompt');
  });

  it('exposes guest-safe scenes with example URLs and no prompts', () => {
    const pack = service.loadPack('stub-a');
    const scenes = service.toGuestScenes(pack);
    expect(scenes).toHaveLength(3);
    expect(scenes[0]).toEqual({
      id: 'beach',
      name: 'Praia',
      tagline: null,
      exampleUrl: '/themes/stub-a/scenes/beach/example',
    });
    for (const scene of scenes) {
      expect(scene).not.toHaveProperty('prompt');
    }
  });

  it('throws when theme pack is missing', () => {
    expect(() => service.loadPack('missing-theme')).toThrow();
  });

  it('returns example image path for a valid scene', () => {
    const imagePath = service.getExampleImagePath('stub-a', 'beach');
    expect(imagePath).toContain('stub-a');
    expect(imagePath).toContain('beach');
    expect(imagePath.endsWith('.png')).toBe(true);
  });

  it('throws when example scene is missing', () => {
    expect(() => service.getExampleImagePath('stub-a', 'missing')).toThrow();
  });

  it('rejects path traversal in themeId', () => {
    expect(() => service.loadPack('../etc')).toThrow();
    expect(() => service.getExampleImagePath('../etc', 'beach')).toThrow();
  });

  it('rejects path traversal in sceneId', () => {
    expect(() => service.getExampleImagePath('stub-a', '../secrets')).toThrow();
  });
});
