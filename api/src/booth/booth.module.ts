import { forwardRef, Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { ThemesModule } from '../themes/themes.module';
import { BoothConfigService } from './booth-config.service';
import { BoothController } from './booth.controller';
import { BoothService } from './booth.service';

@Module({
  imports: [ThemesModule, forwardRef(() => SessionsModule)],
  controllers: [BoothController],
  providers: [BoothService, BoothConfigService],
  exports: [BoothConfigService],
})
export class BoothModule {}
