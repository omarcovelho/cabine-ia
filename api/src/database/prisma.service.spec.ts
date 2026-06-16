import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get(PrismaService);
    await prisma.onModuleInit();
  });

  afterEach(async () => {
    await prisma.onModuleDestroy();
  });

  it('connects and queries the Event model', async () => {
    const count = await prisma.event.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
