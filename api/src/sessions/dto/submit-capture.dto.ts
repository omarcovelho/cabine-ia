import { BadRequestException } from '@nestjs/common';

export function assertValidCropCount(count: number): void {
  if (count < 1 || count > 4) {
    throw new BadRequestException('Capture requires 1 to 4 crop files');
  }
}
