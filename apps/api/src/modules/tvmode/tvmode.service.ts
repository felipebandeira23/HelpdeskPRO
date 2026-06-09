import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface Panel {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  title: string;
  refreshInterval: number;
}

interface DashboardLayout {
  layoutId: string;
  panels: Panel[];
  autoRefresh: boolean;
  refreshInterval: number;
  fullscreen: boolean;
  hideHeader: boolean;
}

@Injectable()
export class TVModeService {
  constructor(private prisma: PrismaService) {}

  getDashboardLayout(layoutId?: string): DashboardLayout {
    return {
      layoutId: layoutId ?? 'default',
      panels: [
        {
          id: 'panel-1',
          type: 'metrics',
          position: { x: 0, y: 0, w: 1, h: 0.5 },
          title: 'Métricas Gerais',
          refreshInterval: 10000,
        },
        {
          id: 'panel-2',
          type: 'sla-semaphore',
          position: { x: 1, y: 0, w: 1, h: 0.5 },
          title: 'Status SLA',
          refreshInterval: 5000,
        },
        {
          id: 'panel-3',
          type: 'open-tickets',
          position: { x: 0, y: 0.5, w: 2, h: 0.5 },
          title: 'Tickets Abertos',
          refreshInterval: 15000,
        },
      ],
      autoRefresh: true,
      refreshInterval: 30000,
      fullscreen: true,
      hideHeader: true,
    };
  }

  getMetricsPanel(): Record<string, number> {
    const totalTickets = 250;
    const openTickets = 45;
    const avgResolutionTime = 4.5;
    const satisfactionRate = 92;

    return {
      totalTickets,
      openTickets,
      closedToday: 12,
      avgResolutionTime,
      satisfactionRate,
      teamsOnline: 8,
    };
  }

  getSLAPanelStatus(): Record<string, unknown> {
    return {
      ok: 180,
      warning: 35,
      breached: 5,
      breachedList: [
        { id: 'ticket-1', title: 'Critical System Down', minutesOverdue: 45 },
        { id: 'ticket-2', title: 'Database Migration', minutesOverdue: 25 },
        { id: 'ticket-3', title: 'Email Outage', minutesOverdue: 15 },
      ],
    };
  }

  getTicketsList(limit: number = 20): Record<string, unknown> {
    return {
      total: 45,
      limit,
      tickets: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `ticket-${i}`,
        title: `Ticket #${i + 1}`,
        status: ['OPEN', 'IN_PROGRESS'][i % 2],
        priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3],
        wait: `${(Math.random() * 100) | 0}h ago`,
      })),
    };
  }

  createCustomLayout(name: string, panels: Panel[]): Record<string, unknown> {
    return {
      layoutId: `layout-${Date.now()}`,
      name,
      panels,
      createdAt: new Date(),
      owner: 'admin',
    };
  }

  scheduleLayoutRotation(layouts: string[], interval: number): Record<string, unknown> {
    return {
      rotationId: `rotation-${Date.now()}`,
      layouts,
      interval,
      status: 'scheduled',
      startTime: new Date(),
    };
  }
}
