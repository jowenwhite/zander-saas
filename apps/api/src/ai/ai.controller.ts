import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutiveChatDto, ZanderChatDto } from './dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // MEDIUM-1: Input validation via ExecutiveChatDto
  @Post('chat')
  async chat(@Req() req: any, @Body() body: ExecutiveChatDto) {
    return this.aiService.chat(
      req.tenantId,
      body.executiveId,
      body.message,
      body.conversationHistory || []
    );
  }

  // MEDIUM-1: Input validation via ZanderChatDto
  @Post('zander/chat')
  async zanderChat(@Req() req: any, @Body() body: ZanderChatDto) {
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