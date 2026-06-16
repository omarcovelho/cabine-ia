import { Injectable } from '@nestjs/common';
import { ThemeSummary } from '../themes/theme.types';
import { ThemeService } from '../themes/theme.service';
import { BoothConfigService } from '../booth/booth-config.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class OperatorThemeService {
  constructor(
    private readonly themeService: ThemeService,
    private readonly boothConfigService: BoothConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  listThemes(): ThemeSummary[] {
    return this.themeService.listThemeIds().map((themeId) => {
      const pack = this.themeService.loadPack(themeId);
      return this.themeService.toThemeSummary(pack);
    });
  }

  async setActiveTheme(themeId: string): Promise<ThemeSummary> {
    await this.sessionsService.assertNoOpenSession();
    const pack = this.themeService.loadPack(themeId);
    await this.boothConfigService.setActiveThemeId(themeId);
    return this.themeService.toThemeSummary(pack);
  }
}
