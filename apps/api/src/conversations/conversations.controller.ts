import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * GET /conversations?executiveType=DON
   * Returns last 50 messages for this tenant+executive, ordered by createdAt asc
   */
  @Get()
  async getConversation(
    @Request() req,
    @Query('executiveType') executiveType: string,
    @Query('limit') limit?: string,
  ) {
    if (!executiveType) {
      throw new BadRequestException('executiveType query parameter is required');
    }

    const validTypes = ['DON', 'JORDAN', 'PAM', 'BEN', 'MIRANDA', 'TED', 'JARVIS'];
    const normalizedType = executiveType.toUpperCase();

    if (!validTypes.includes(normalizedType)) {
      throw new BadRequestException(
        `Invalid executiveType. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const messages = await this.conversationsService.getConversation(
      req.user.tenantId,
      normalizedType,
      limit ? parseInt(limit, 10) : 50,
    );

    return { messages };
  }

  /**
   * POST /conversations
   * Saves a message { executiveType, role, content, metadata? }
   */
  @Post()
  async saveMessage(
    @Request() req,
    @Body()
    body: {
      executiveType: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, any>;
    },
  ) {
    if (!body.executiveType || !body.role || !body.content) {
      throw new BadRequestException(
        'executiveType, role, and content are required',
      );
    }

    if (!['user', 'assistant'].includes(body.role)) {
      throw new BadRequestException('role must be "user" or "assistant"');
    }

    const validTypes = ['DON', 'JORDAN', 'PAM', 'BEN', 'MIRANDA', 'TED', 'JARVIS'];
    const normalizedType = body.executiveType.toUpperCase();

    if (!validTypes.includes(normalizedType)) {
      throw new BadRequestException(
        `Invalid executiveType. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const message = await this.conversationsService.saveMessage(
      req.user.tenantId,
      {
        executiveType: normalizedType,
        role: body.role,
        content: body.content,
        metadata: body.metadata,
      },
    );

    return { success: true, message };
  }

  /**
   * DELETE /conversations?executiveType=DON
   * Clears conversation for this tenant+executive (for "New Conversation" button)
   */
  @Delete()
  async clearConversation(
    @Request() req,
    @Query('executiveType') executiveType: string,
  ) {
    if (!executiveType) {
      throw new BadRequestException('executiveType query parameter is required');
    }

    const validTypes = ['DON', 'JORDAN', 'PAM', 'BEN', 'MIRANDA', 'TED', 'JARVIS'];
    const normalizedType = executiveType.toUpperCase();

    if (!validTypes.includes(normalizedType)) {
      throw new BadRequestException(
        `Invalid executiveType. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const result = await this.conversationsService.clearConversation(
      req.user.tenantId,
      normalizedType,
    );

    return { success: true, ...result };
  }

  /**
   * GET /conversations/topics
   * Returns recent conversation topics for cross-executive context
   */
  @Get('topics')
  async getRecentTopics(@Request() req) {
    const topics = await this.conversationsService.getRecentTopics(
      req.user.tenantId,
    );

    return { topics };
  }
}
