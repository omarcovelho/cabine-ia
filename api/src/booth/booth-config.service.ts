import { Injectable, NotFoundException } from '@nestjs/common';
import { BoothConfig, Prisma } from '@prisma/client';
import { BOOTH_CONFIG_ID } from './booth-config.constants';
import { PrismaService } from '../database/prisma.service';

export type BoothConfigWithEvent = Prisma.BoothConfigGetPayload<{
  include: { activeEvent: true };
}>;

@Injectable()
export class BoothConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoothConfig(): Promise<BoothConfigWithEvent> {
    const boothConfig = await this.prisma.boothConfig.findUnique({
      where: { id: BOOTH_CONFIG_ID },
      include: { activeEvent: true },
    });

    if (!boothConfig) {
      throw new NotFoundException('Booth config not found');
    }

    return boothConfig;
  }

  toSummary(boothConfig: BoothConfig): Pick<BoothConfig, 'activeEventId' | 'activeThemeId'> {
    return {
      activeEventId: boothConfig.activeEventId,
      activeThemeId: boothConfig.activeThemeId,
    };
  }
}
