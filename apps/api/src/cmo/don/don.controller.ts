import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DonService } from './don.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('cmo/don')
@UseGuards(JwtAuthGuard)
export class DonController {
  constructor(private readonly donService: DonService) {}

  @Post('chat')
  async chat(
    @Req() req: any,
    @Body() body: { message: string; conversationHistory?: any[] }
  ) {
    return this.donService.chat(
      req.tenantId,
      body.message,
      body.conversationHistory || []
    );
  }
}
