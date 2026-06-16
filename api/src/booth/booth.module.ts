import { Module } from '@nestjs/common';
import { BoothConfigService } from './booth-config.service';
import { BoothController } from './booth.controller';
import { BoothService } from './booth.service';

@Module({
  controllers: [BoothController],
  providers: [BoothService, BoothConfigService],
  exports: [BoothConfigService],
})
export class BoothModule {}
