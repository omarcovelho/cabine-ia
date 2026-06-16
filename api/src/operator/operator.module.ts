import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoothModule } from '../booth/booth.module';
import { SessionsModule } from '../sessions/sessions.module';
import { ThemesModule } from '../themes/themes.module';
import { EventsService } from './events/events.service';
import { OperatorThemeService } from './operator-theme.service';
import { OperatorController } from './operator.controller';

@Module({
  imports: [
    AuthModule,
    BoothModule,
    ThemesModule,
    forwardRef(() => SessionsModule),
  ],
  controllers: [OperatorController],
  providers: [OperatorThemeService, EventsService],
})
export class OperatorModule {}
