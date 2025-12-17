import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Req() req: any,
    @Body() body: { executiveId: string; message: string; conversationHistory?: any[] }
  ) {
    return this.aiService.chat(
      req.tenantId,
      body.executiveId,
      body.message,
      body.conversationHistory || []
    );
  }
}
