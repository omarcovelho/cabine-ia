import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';

export type CropFilePayload = {
  buffer: Buffer;
};

@Injectable()
export class CaptureStorageService {
  constructor(private readonly tmpRoot: string) {}

  getSessionDir(sessionId: string): string {
    return join(this.tmpRoot, sessionId);
  }

  async saveCrops(
    sessionId: string,
    crops: CropFilePayload[],
  ): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    await mkdir(sessionDir, { recursive: true });

    await Promise.all(
      crops.map((crop, index) =>
        writeFile(
          join(sessionDir, `crop-${index + 1}.jpg`),
          crop.buffer,
        ),
      ),
    );
  }
}
