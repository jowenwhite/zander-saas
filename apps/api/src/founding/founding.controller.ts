import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { FoundingService } from './founding.service';
import { UpdateFoundingDto, UpdateFieldDto } from './dto/update-founding.dto';

@Controller('founding')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class FoundingController {
  constructor(private readonly foundingService: FoundingService) {}

  /**
   * GET /founding - Get the tenant's founding document
   */
  @Get()
  async findOne(@Request() req: any) {
    return this.foundingService.findOne(req.user.tenantId);
  }

  /**
   * PUT /founding - Upsert the entire document
   */
  @Put()
  async upsert(@Request() req: any, @Body() data: UpdateFoundingDto) {
    return this.foundingService.upsert(req.user.tenantId, data);
  }

  /**
   * PATCH /founding/vision - Update just vision
   */
  @Patch('vision')
  async updateVision(@Request() req: any, @Body() data: UpdateFieldDto) {
    return this.foundingService.updateVision(req.user.tenantId, data.value || '');
  }

  /**
   * PATCH /founding/mission - Update just mission
   */
  @Patch('mission')
  async updateMission(@Request() req: any, @Body() data: UpdateFieldDto) {
    return this.foundingService.updateMission(req.user.tenantId, data.value || '');
  }

  /**
   * PATCH /founding/values - Update just values array
   */
  @Patch('values')
  async updateValues(@Request() req: any, @Body() data: UpdateFieldDto) {
    return this.foundingService.updateValues(req.user.tenantId, data.values || []);
  }

  /**
   * PATCH /founding/story - Update just story
   */
  @Patch('story')
  async updateStory(@Request() req: any, @Body() data: UpdateFieldDto) {
    return this.foundingService.updateStory(req.user.tenantId, data.value || '');
  }
}
