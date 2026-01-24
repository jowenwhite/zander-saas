import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CmoCalendarService {
  constructor(private prisma: PrismaService) {}

  // Monthly Themes
  async getThemes(tenantId: string, year?: number) {
    const where: any = { tenantId };
    if (year) {
      where.year = year;
    }
    return this.prisma.monthlyTheme.findMany({
      where,
      include: {
        _count: { select: { calendarEvents: true } },
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
  }

  async getTheme(tenantId: string, year: number, month: number) {
    const theme = await this.prisma.monthlyTheme.findFirst({
      where: { tenantId, year, month },
      include: {
        _count: { select: { calendarEvents: true } },
      },
    });
    if (!theme) {
      throw new NotFoundException('Monthly theme not found');
    }
    return theme;
  }

  async createTheme(
    tenantId: string,
    data: {
      year: number;
      month: number;
      name: string;
      description?: string;
      focusAreas?: string[];
      colorCode?: string;
    },
  ) {
    return this.prisma.monthlyTheme.upsert({
      where: {
        tenantId_year_month: { tenantId, year: data.year, month: data.month },
      },
      update: {
        name: data.name,
        description: data.description,
        focusAreas: data.focusAreas || [],
        colorCode: data.colorCode,
      },
      create: {
        tenantId,
        year: data.year,
        month: data.month,
        name: data.name,
        description: data.description,
        focusAreas: data.focusAreas || [],
        colorCode: data.colorCode,
      },
    });
  }

  async updateTheme(
    tenantId: string,
    year: number,
    month: number,
    data: {
      name?: string;
      description?: string;
      focusAreas?: string[];
      colorCode?: string;
      isActive?: boolean;
    },
  ) {
    const theme = await this.prisma.monthlyTheme.findFirst({
      where: { tenantId, year, month },
    });
    if (!theme) {
      throw new NotFoundException('Monthly theme not found');
    }

    return this.prisma.monthlyTheme.update({
      where: { id: theme.id },
      data: {
        name: data.name,
        description: data.description,
        focusAreas: data.focusAreas,
        colorCode: data.colorCode,
        isActive: data.isActive,
      },
    });
  }

  async deleteTheme(tenantId: string, year: number, month: number) {
    const theme = await this.prisma.monthlyTheme.findFirst({
      where: { tenantId, year, month },
    });
    if (!theme) {
      throw new NotFoundException('Monthly theme not found');
    }

    await this.prisma.monthlyTheme.delete({ where: { id: theme.id } });
    return { success: true, message: 'Monthly theme deleted successfully' };
  }

  // Weekly Schedule
  async getSchedule(tenantId: string, week: string = 'current') {
    const now = new Date();
    let weekStart: Date;
    let weekEnd: Date;

    if (week === 'current') {
      // Get start of current week (Monday)
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      // Get end of current week (Sunday)
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
    } else {
      // Parse ISO date for custom week
      weekStart = new Date(week);
      weekStart.setHours(0, 0, 0, 0);
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
    }

    // Get calendar events for the week
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        startTime: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    // Get current month's theme
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthlyTheme = await this.prisma.monthlyTheme.findFirst({
      where: {
        tenantId,
        year: currentYear,
        month: currentMonth,
        isActive: true,
      },
    });

    // Transform events to schedule format
    const scheduleEvents = events.map((event) => ({
      id: event.id,
      date: event.startTime.toISOString(),
      title: event.title,
      type: this.mapEventType(event.eventType),
      status: this.mapEventStatus(event),
    }));

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      events: scheduleEvents,
      monthlyTheme: monthlyTheme
        ? {
            id: monthlyTheme.id,
            name: monthlyTheme.name,
            description: monthlyTheme.description,
          }
        : undefined,
    };
  }

  private mapEventType(eventType: string): 'email' | 'social' | 'blog' | 'campaign' {
    const mapping: Record<string, 'email' | 'social' | 'blog' | 'campaign'> = {
      email: 'email',
      social_post: 'social',
      blog_post: 'blog',
      campaign: 'campaign',
      meeting: 'campaign',
      task: 'campaign',
    };
    return mapping[eventType] || 'campaign';
  }

  private mapEventStatus(event: any): 'scheduled' | 'published' | 'draft' {
    const now = new Date();
    if (event.startTime < now) {
      return 'published';
    }
    return 'scheduled';
  }

  // Idea Parking Lot
  async getIdeas(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }
    return this.prisma.ideaParkingLot.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getIdea(id: string, tenantId: string) {
    const idea = await this.prisma.ideaParkingLot.findFirst({
      where: { id, tenantId },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }
    return idea;
  }

  async createIdea(
    tenantId: string,
    data: {
      title: string;
      description?: string;
      category?: string;
      source?: string;
      priority?: string;
    },
  ) {
    return this.prisma.ideaParkingLot.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        category: data.category,
        source: data.source,
        priority: data.priority || 'normal',
        status: 'parked',
      },
    });
  }

  async updateIdea(
    id: string,
    tenantId: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      source?: string;
      priority?: string;
      status?: string;
      reviewNotes?: string;
    },
  ) {
    const idea = await this.prisma.ideaParkingLot.findFirst({
      where: { id, tenantId },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      category: data.category,
      source: data.source,
      priority: data.priority,
      status: data.status,
      reviewNotes: data.reviewNotes,
    };

    // If status is changing from parked to reviewing/approved/rejected, set reviewedAt
    if (data.status && data.status !== 'parked' && idea.status === 'parked') {
      updateData.reviewedAt = new Date();
    }

    return this.prisma.ideaParkingLot.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteIdea(id: string, tenantId: string) {
    const idea = await this.prisma.ideaParkingLot.findFirst({
      where: { id, tenantId },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    await this.prisma.ideaParkingLot.delete({ where: { id } });
    return { success: true, message: 'Idea deleted successfully' };
  }
}
