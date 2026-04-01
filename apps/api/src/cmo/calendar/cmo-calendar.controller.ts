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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CmoCalendarService } from './cmo-calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('cmo/calendar')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
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
    @Body() createData: CreateCalendarEventDto,
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
    @Body() updateData: UpdateCalendarEventDto,
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
    @Body() createData: CreateThemeDto,
  ) {
    return this.cmoCalendarService.createTheme(req.tenantId, createData);
  }

  @Patch('themes/:year/:month')
  async updateTheme(
    @Param('year') year: string,
    @Param('month') month: string,
    @Request() req,
    @Body() updateData: UpdateThemeDto,
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
    @Body() createData: CreateIdeaDto,
  ) {
    return this.cmoCalendarService.createIdea(req.tenantId, createData);
  }

  @Patch('ideas/:id')
  async updateIdea(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: UpdateIdeaDto,
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
