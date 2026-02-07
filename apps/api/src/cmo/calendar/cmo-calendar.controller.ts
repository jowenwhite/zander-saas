import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CmoCalendarService } from './cmo-calendar.service';

@Controller('cmo/calendar')
export class CmoCalendarController {
  constructor(private readonly cmoCalendarService: CmoCalendarService) {}

  // Calendar Events
  @Get('events')
  async getEvents(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.cmoCalendarService.getEvents(req.tenantId, {
      startDate,
      endDate,
      type,
    });
  }

  @Get('events/:id')
  async getEvent(@Param('id') id: string, @Request() req) {
    return this.cmoCalendarService.getEvent(id, req.tenantId);
  }

  @Post('events')
  async createEvent(
    @Request() req,
    @Body()
    createData: {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      allDay?: boolean;
      eventType?: string;
      color?: string;
      monthlyThemeId?: string;
    },
  ) {
    return this.cmoCalendarService.createEvent(
      req.tenantId,
      req.user.id,
      createData,
    );
  }

  @Patch('events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      allDay?: boolean;
      eventType?: string;
      color?: string;
      monthlyThemeId?: string;
    },
  ) {
    return this.cmoCalendarService.updateEvent(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string, @Request() req) {
    return this.cmoCalendarService.deleteEvent(id, req.tenantId);
  }

  // Weekly Schedule
  @Get('schedule')
  async getSchedule(@Request() req, @Query('week') week?: string) {
    return this.cmoCalendarService.getSchedule(req.tenantId, week || 'current');
  }

  // Monthly Themes
  @Get('themes')
  async getThemes(@Request() req, @Query('year') year?: string) {
    return this.cmoCalendarService.getThemes(
      req.tenantId,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('themes/:year/:month')
  async getTheme(
    @Param('year') year: string,
    @Param('month') month: string,
    @Request() req,
  ) {
    return this.cmoCalendarService.getTheme(
      req.tenantId,
      parseInt(year),
      parseInt(month),
    );
  }

  @Post('themes')
  async createTheme(
    @Request() req,
    @Body()
    createData: {
      year: number;
      month: number;
      name: string;
      description?: string;
      focusAreas?: string[];
      colorCode?: string;
    },
  ) {
    return this.cmoCalendarService.createTheme(req.tenantId, createData);
  }

  @Patch('themes/:year/:month')
  async updateTheme(
    @Param('year') year: string,
    @Param('month') month: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      focusAreas?: string[];
      colorCode?: string;
      isActive?: boolean;
    },
  ) {
    return this.cmoCalendarService.updateTheme(
      req.tenantId,
      parseInt(year),
      parseInt(month),
      updateData,
    );
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('themes/:year/:month')
  async deleteTheme(
    @Param('year') year: string,
    @Param('month') month: string,
    @Request() req,
  ) {
    return this.cmoCalendarService.deleteTheme(
      req.tenantId,
      parseInt(year),
      parseInt(month),
    );
  }

  // Idea Parking Lot
  @Get('ideas')
  async getIdeas(@Request() req, @Query('status') status?: string) {
    return this.cmoCalendarService.getIdeas(req.tenantId, status);
  }

  @Get('ideas/:id')
  async getIdea(@Param('id') id: string, @Request() req) {
    return this.cmoCalendarService.getIdea(id, req.tenantId);
  }

  @Post('ideas')
  async createIdea(
    @Request() req,
    @Body()
    createData: {
      title: string;
      description?: string;
      category?: string;
      source?: string;
      priority?: string;
    },
  ) {
    return this.cmoCalendarService.createIdea(req.tenantId, createData);
  }

  @Patch('ideas/:id')
  async updateIdea(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      title?: string;
      description?: string;
      category?: string;
      source?: string;
      priority?: string;
      status?: string;
      reviewNotes?: string;
    },
  ) {
    return this.cmoCalendarService.updateIdea(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('ideas/:id')
  async deleteIdea(@Param('id') id: string, @Request() req) {
    return this.cmoCalendarService.deleteIdea(id, req.tenantId);
  }
}
