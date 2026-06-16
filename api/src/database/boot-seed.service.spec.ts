import { Test, TestingModule } from '@nestjs/testing';
import { BOOTH_CONFIG_ID } from '../booth/booth-config.constants';
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

  it('seeds default event and singleton booth config on empty database', async () => {
    await bootSeed.seedIfEmpty();

    const boothConfig = await prisma.boothConfig.findUnique({
      where: { id: BOOTH_CONFIG_ID },
      include: { activeEvent: true },
    });

    expect(boothConfig).not.toBeNull();
    expect(boothConfig?.activeThemeId).toBe('stub-a');
    expect(boothConfig?.activeEvent.name).toBe('Default Event');
    expect(boothConfig?.activeEventId).toBe(boothConfig?.activeEvent.id);
  });

  it('does not duplicate booth config when seed runs twice', async () => {
    await bootSeed.seedIfEmpty();
    await bootSeed.seedIfEmpty();

    const eventCount = await prisma.event.count();
    const boothConfigCount = await prisma.boothConfig.count();
    expect(eventCount).toBe(1);
    expect(boothConfigCount).toBe(1);
  });
});
