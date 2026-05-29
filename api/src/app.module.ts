import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoothModule } from './booth/booth.module';
import { HealthModule } from './health/health.module';
import { OperatorModule } from './operator/operator.module';

@Module({
  imports: [AuthModule, HealthModule, BoothModule, OperatorModule],
})
export class AppModule {}
