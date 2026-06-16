import { Global, Module } from '@nestjs/common';
import { BootSeedService } from './boot-seed.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, BootSeedService],
  exports: [PrismaService],
})
export class DatabaseModule {}
