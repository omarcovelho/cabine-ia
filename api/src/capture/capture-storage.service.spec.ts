import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CaptureStorageService } from './capture-storage.service';

describe('CaptureStorageService', () => {
  let tmpRoot: string;
  let service: CaptureStorageService;

  beforeEach(async () => {
    tmpRoot = await mkdtemp(join(tmpdir(), 'cabine-capture-'));
    service = new CaptureStorageService(tmpRoot);
  });

  afterEach(async () => {
    await rm(tmpRoot, { recursive: true, force: true });
  });

  it('writes numbered crop files under session directory', async () => {
    await service.saveCrops('session-1', [
      { buffer: Buffer.from('crop-a') },
      { buffer: Buffer.from('crop-b') },
    ]);

    const crop1 = await readFile(
      join(tmpRoot, 'session-1', 'crop-1.jpg'),
    );
    const crop2 = await readFile(
      join(tmpRoot, 'session-1', 'crop-2.jpg'),
    );

    expect(crop1.toString()).toBe('crop-a');
    expect(crop2.toString()).toBe('crop-b');
  });
});
