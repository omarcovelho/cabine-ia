import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemesController } from './themes.controller';

@Module({
  controllers: [ThemesController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemesModule {}
