import { forwardRef, Module } from '@nestjs/common';
import { BoothModule } from '../booth/booth.module';
import { CaptureModule } from '../capture/capture.module';
import { DatabaseModule } from '../database/database.module';
import { ThemesModule } from '../themes/themes.module';
import { SessionFsmService } from './session-fsm.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    DatabaseModule,
    CaptureModule,
    forwardRef(() => BoothModule),
    ThemesModule,
  ],
  controllers: [SessionsController],
  providers: [SessionFsmService, SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
