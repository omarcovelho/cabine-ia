import { BadRequestException } from '@nestjs/common';
import type { UploadedCropFile } from '../uploaded-crop.types';

function isUploadedCropFile(file: unknown): file is UploadedCropFile {
  if (typeof file !== 'object' || file === null) {
    return false;
  }

  const record = file as Record<string, unknown>;
  return Buffer.isBuffer(record.buffer);
}

export function parseUploadedCropFiles(files: unknown): UploadedCropFile[] {
  if (files === undefined || files === null) {
    return [];
  }

  if (!Array.isArray(files)) {
    throw new BadRequestException('Capture requires 1 to 4 crop files');
  }

  if (!files.every(isUploadedCropFile)) {
    throw new BadRequestException('Capture requires 1 to 4 crop files');
  }

  return files;
}

export function assertValidCropCount(count: number): void {
  if (count < 1 || count > 4) {
    throw new BadRequestException('Capture requires 1 to 4 crop files');
  }
}
