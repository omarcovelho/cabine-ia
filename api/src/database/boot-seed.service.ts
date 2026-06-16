import { Injectable, OnModuleInit } from '@nestjs/common';
import { BOOTH_CONFIG_ID } from '../booth/booth-config.constants';
import { PrismaService } from './prisma.service';

@Injectable()
export class BootSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const existing = await this.prisma.boothConfig.findUnique({
      where: { id: BOOTH_CONFIG_ID },
    });
    if (existing) {
      return;
    }

    const event = await this.prisma.event.create({
      data: {
        name: 'Default Event',
      },
    });

    await this.prisma.boothConfig.create({
      data: {
        id: BOOTH_CONFIG_ID,
        activeEventId: event.id,
        activeThemeId: 'stub-a',
      },
    });
  }
}
