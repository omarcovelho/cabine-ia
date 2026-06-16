import { Test, TestingModule } from '@nestjs/testing';
import { BootSeedService } from './boot-seed.service';
import { PrismaService } from './prisma.service';

describe('BootSeedService', () => {
  let prisma: PrismaService;
  let bootSeed: BootSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, BootSeedService],
    }).compile();

    prisma = module.get(PrismaService);
    await prisma.onModuleInit();
    bootSeed = module.get(BootSeedService);

    await prisma.session.deleteMany();
    await prisma.boothConfig.deleteMany();
    await prisma.event.deleteMany();
  });

  afterEach(async () => {
    await prisma.onModuleDestroy();
  });

  it('seeds default event and booth config on empty database', async () => {
    await bootSeed.seedIfEmpty();

    const events = await prisma.event.findMany({
      include: { boothConfig: true },
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.name).toBe('Default Event');
    expect(events[0]?.boothConfig?.activeThemeId).toBe('stub-a');
  });

  it('does not duplicate events when seed runs twice', async () => {
    await bootSeed.seedIfEmpty();
    await bootSeed.seedIfEmpty();

    const eventCount = await prisma.event.count();
    expect(eventCount).toBe(1);
  });
});
