import { Module } from '@nestjs/common';
import { BoothModule } from './booth/booth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, BoothModule],
})
export class AppModule {}
