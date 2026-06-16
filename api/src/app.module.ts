import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoothModule } from './booth/booth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { OperatorModule } from './operator/operator.module';
import { ThemesModule } from './themes/themes.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HealthModule,
    BoothModule,
    OperatorModule,
    ThemesModule,
  ],
})
export class AppModule {}
