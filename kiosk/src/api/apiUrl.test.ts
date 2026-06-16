import { describe, expect, it } from 'vitest';
import { toApiUrl } from './apiUrl';

describe('toApiUrl', () => {
  it('prefixes root-relative API paths', () => {
    expect(toApiUrl('/themes/stub-a/scenes/beach/example')).toBe(
      '/api/themes/stub-a/scenes/beach/example',
    );
  });

  it('leaves already-prefixed paths unchanged', () => {
    expect(toApiUrl('/api/booth')).toBe('/api/booth');
  });
});
