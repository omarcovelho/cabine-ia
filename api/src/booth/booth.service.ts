import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { ThemeService } from '../themes/theme.service';
import { BoothConfigService } from './booth-config.service';
import { BoothSnapshot } from './booth.types';
import { resolveBoothPhase } from './resolve-booth-phase';

@Injectable()
export class BoothService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boothConfigService: BoothConfigService,
    private readonly sessionsService: SessionsService,
    private readonly themeService: ThemeService,
  ) {}

  async getSnapshot(): Promise<BoothSnapshot> {
    const boothConfig = await this.boothConfigService.getBoothConfig();
    const openSession = await this.sessionsService.getOpenSession();
    const phase = resolveBoothPhase(openSession) as BoothSnapshot['phase'];
    const themePack = this.themeService.loadPack(boothConfig.activeThemeId);
    const theme = this.themeService.toThemeSummary(themePack);

    const eventRecord = openSession
      ? await this.prisma.event.findUniqueOrThrow({
          where: { id: openSession.eventId },
        })
      : boothConfig.activeEvent;

    const scenes =
      phase === 'attract' ? [] : this.themeService.toGuestScenes(themePack);

    let session: BoothSnapshot['session'] = null;
    if (openSession) {
      const sceneName =
        openSession.sceneId && phase === 'capture_ready'
          ? (themePack.scenes.find((scene) => scene.id === openSession.sceneId)
              ?.name ?? null)
          : null;

      session = {
        id: openSession.id,
        sceneId: openSession.sceneId,
        sceneName,
      };
    }

    return {
      phase,
      event: { id: eventRecord.id, name: eventRecord.name },
      theme,
      scenes,
      config: {},
      session,
    };
  }
}
