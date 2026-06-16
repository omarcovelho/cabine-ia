import { NotFoundException } from '@nestjs/common';
import { resolve, sep } from 'node:path';

/** Lowercase slug: stub-a, beach, stub-b */
const PACK_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertSafePackId(id: string, label = 'id'): void {
  if (!PACK_ID_PATTERN.test(id)) {
    throw new NotFoundException(`Invalid ${label}`);
  }
}

export function resolveUnderRoot(
  rootDir: string,
  ...segments: string[]
): string {
  const resolved = resolve(rootDir, ...segments);
  const normalizedRoot = resolve(rootDir);
  const rootPrefix = normalizedRoot.endsWith(sep)
    ? normalizedRoot
    : `${normalizedRoot}${sep}`;

  if (resolved !== normalizedRoot && !resolved.startsWith(rootPrefix)) {
    throw new NotFoundException('Invalid path');
  }

  return resolved;
}

export function resolveRelativeFileUnderRoot(
  rootDir: string,
  relativePath: string,
): string {
  if (
    relativePath.length === 0 ||
    relativePath.startsWith('/') ||
    relativePath.includes('..')
  ) {
    throw new NotFoundException('Invalid path');
  }

  const segments = relativePath
    .split('/')
    .filter((segment) => segment.length > 0);
  return resolveUnderRoot(rootDir, ...segments);
}
