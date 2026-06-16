import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BoothConfigService } from '../../booth/booth-config.service';
import { SessionsService } from '../../sessions/sessions.service';

export interface OperatorEventSummary {
  id: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boothConfigService: BoothConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  async listEvents(): Promise<OperatorEventSummary[]> {
    const boothConfig = await this.boothConfigService.getBoothConfig();
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      createdAt: event.createdAt,
      isActive: event.id === boothConfig.activeEventId,
    }));
  }

  async createEvent(name: string): Promise<OperatorEventSummary> {
    const boothConfig = await this.boothConfigService.getBoothConfig();
    const event = await this.prisma.event.create({
      data: { name },
    });

    return {
      id: event.id,
      name: event.name,
      createdAt: event.createdAt,
      isActive: event.id === boothConfig.activeEventId,
    };
  }

  async activateEvent(eventId: string): Promise<OperatorEventSummary> {
    await this.sessionsService.assertNoOpenSession();

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event not found: ${eventId}`);
    }

    await this.boothConfigService.setActiveEventId(eventId);

    return {
      id: event.id,
      name: event.name,
      createdAt: event.createdAt,
      isActive: true,
    };
  }
}
