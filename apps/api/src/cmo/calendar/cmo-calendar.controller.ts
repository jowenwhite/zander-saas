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
} from '@nestjs/common';
import { CmoCalendarService } from './cmo-calendar.service';

@Controller('cmo/calendar')
export class CmoCalendarController {
  constructor(private readonly cmoCalendarService: CmoCalendarService) {}

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

  @Delete('ideas/:id')
  async deleteIdea(@Param('id') id: string, @Request() req) {
    return this.cmoCalendarService.deleteIdea(id, req.tenantId);
  }
}
