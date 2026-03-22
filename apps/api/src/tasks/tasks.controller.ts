import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Request() req: any, @Query() query: any) {
    return this.tasksService.findAll(req.user.tenantId, query);
  }

  @Get('overdue')
  async getOverdue(@Request() req: any) {
    return this.tasksService.getOverdueTasks(req.user.tenantId);
  }

  @Get('today')
  async getToday(@Request() req: any) {
    return this.tasksService.getTasksDueToday(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.tasksService.create(body, req.user.tenantId, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.tasksService.update(id, body, req.user.tenantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.delete(id, req.user.tenantId);
  }
}
