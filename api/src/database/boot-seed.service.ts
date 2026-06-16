import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class BootSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const eventCount = await this.prisma.event.count();
    if (eventCount > 0) {
      return;
    }

    await this.prisma.event.create({
      data: {
        name: 'Default Event',
        boothConfig: {
          create: {
            activeThemeId: 'stub-a',
          },
        },
      },
    });
  }
}
