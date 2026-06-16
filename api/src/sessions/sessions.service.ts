import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Session } from '@prisma/client';
import { BoothConfigService } from '../booth/booth-config.service';
import { PrismaService } from '../database/prisma.service';
import { ThemeService } from '../themes/theme.service';
import { InvalidSessionTransitionError } from './session-fsm.errors';
import { SessionFsmService } from './session-fsm.service';
import {
  isOpenSessionPhase,
  OPEN_SESSION_PHASES,
  SessionDto,
  toSessionDto,
} from './session.types';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boothConfigService: BoothConfigService,
    private readonly sessionFsm: SessionFsmService,
    private readonly themeService: ThemeService,
  ) {}

  async start(): Promise<SessionDto> {
    const openSession = await this.findOpenSession();
    try {
      this.sessionFsm.assertCanStart(openSession !== null);
    } catch (error) {
      if (error instanceof InvalidSessionTransitionError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    const boothConfig = await this.boothConfigService.getBoothConfig();
    const session = await this.prisma.session.create({
      data: {
        eventId: boothConfig.activeEventId,
        phase: this.sessionFsm.nextPhaseAfterStart(),
      },
    });

    return toSessionDto(session);
  }

  async selectScene(sceneId: string): Promise<SessionDto> {
    const session = await this.requireOpenSession();
    try {
      this.sessionFsm.assertCanSelectScene(session.phase);
    } catch (error) {
      if (error instanceof InvalidSessionTransitionError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    const boothConfig = await this.boothConfigService.getBoothConfig();
    this.assertSceneExists(boothConfig.activeThemeId, sceneId);

    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        phase: this.sessionFsm.nextPhaseAfterSelectScene(),
        sceneId,
      },
    });

    return toSessionDto(updated);
  }

  async goBack(): Promise<SessionDto> {
    const session = await this.requireOpenSession();
    try {
      this.sessionFsm.assertCanGoBack(session.phase);
    } catch (error) {
      if (error instanceof InvalidSessionTransitionError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        phase: this.sessionFsm.nextPhaseAfterBack(),
        sceneId: null,
      },
    });

    return toSessionDto(updated);
  }

  private async findOpenSession(): Promise<Session | null> {
    const sessions = await this.prisma.session.findMany({
      where: { phase: { in: [...OPEN_SESSION_PHASES] } },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const session = sessions[0];
    if (!session || !isOpenSessionPhase(session.phase)) {
      return null;
    }

    return session;
  }

  private async requireOpenSession(): Promise<Session> {
    const session = await this.findOpenSession();
    if (!session) {
      throw new NotFoundException('No open session');
    }

    return session;
  }

  private assertSceneExists(themeId: string, sceneId: string): void {
    const pack = this.themeService.loadPack(themeId);
    const scene = pack.scenes.find((entry) => entry.id === sceneId);
    if (!scene) {
      throw new NotFoundException(`Scene not found: ${themeId}/${sceneId}`);
    }
  }
}
