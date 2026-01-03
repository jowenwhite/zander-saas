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


  @Post('zander/chat')
  async zanderChat(
    @Req() req: any,
    @Body() body: { message: string; conversationHistory?: any[] }
  ) {
    // Only SuperAdmin can access Zander
    if (!req.user?.isSuperAdmin) {
      throw new Error('Unauthorized: Zander is only accessible to SuperAdmin');
    }
    return this.aiService.zanderChat(
      req.user.userId,
      body.message,
      body.conversationHistory || []
    );
  }

}