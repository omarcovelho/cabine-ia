import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

function databaseFilePath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('file:')) {
    return null;
  }

  return url.slice('file:'.length);
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    const dbPath = databaseFilePath();
    if (dbPath) {
      await mkdir(dirname(dbPath), { recursive: true });
    }

    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
