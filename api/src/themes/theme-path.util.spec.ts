import { NotFoundException } from '@nestjs/common';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertSafePackId,
  resolveRelativeFileUnderRoot,
  resolveUnderRoot,
} from './theme-path.util';

describe('theme-path.util', () => {
  it('accepts valid pack ids', () => {
    expect(() => assertSafePackId('stub-a', 'themeId')).not.toThrow();
    expect(() => assertSafePackId('beach', 'sceneId')).not.toThrow();
  });

  it('rejects traversal and invalid characters in pack ids', () => {
    expect(() => assertSafePackId('../etc', 'themeId')).toThrow(
      NotFoundException,
    );
    expect(() => assertSafePackId('stub/a', 'themeId')).toThrow(
      NotFoundException,
    );
  });

  it('resolves paths only under the root directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'cabine-theme-'));
    try {
      mkdirSync(join(root, 'stub-a'), { recursive: true });
      writeFileSync(join(root, 'stub-a', 'manifest.json'), '{}');

      expect(resolveUnderRoot(root, 'stub-a')).toBe(join(root, 'stub-a'));
      expect(() => resolveUnderRoot(root, '..', 'etc', 'passwd')).toThrow(
        NotFoundException,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects relative files that escape the root', () => {
    const root = mkdtempSync(join(tmpdir(), 'cabine-theme-'));
    try {
      expect(() =>
        resolveRelativeFileUnderRoot(root, '../outside.png'),
      ).toThrow(NotFoundException);
      expect(
        resolveRelativeFileUnderRoot(root, 'scenes/beach/example.png'),
      ).toBe(join(root, 'scenes', 'beach', 'example.png'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
