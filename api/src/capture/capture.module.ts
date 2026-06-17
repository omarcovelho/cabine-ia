import { Module } from '@nestjs/common';
import { join } from 'node:path';
import { CaptureStorageService } from './capture-storage.service';

@Module({
  providers: [
    {
      provide: CaptureStorageService,
      useFactory: () =>
        new CaptureStorageService(join(process.cwd(), 'data', 'tmp')),
    },
  ],
  exports: [CaptureStorageService],
})
export class CaptureModule {}
