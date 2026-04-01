import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DonService } from './don.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { DonChatDto } from './dto';

@Controller('cmo/don')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class DonController {
  constructor(private readonly donService: DonService) {}

  // MEDIUM-1: Input validation via DonChatDto
  @Post('chat')
  async chat(@Req() req: any, @Body() body: DonChatDto) {
    return this.donService.chat(
      req.tenantId,
      body.message,
      body.conversationHistory || []
    );
  }
}
