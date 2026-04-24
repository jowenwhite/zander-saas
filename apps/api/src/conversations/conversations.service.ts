import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get conversation history for a specific executive
   * Returns last 50 messages ordered by createdAt ascending
   */
  async getConversation(tenantId: string, executiveType: string, limit = 50) {
    const messages = await this.prisma.executiveConversation.findMany({
      where: {
        tenantId,
        executiveType: executiveType.toUpperCase(),
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        executiveType: true,
        role: true,
        content: true,
        metadata: true,
        createdAt: true,
      },
    });

    return messages;
  }

  /**
   * Save a single message to conversation history
   */
  async saveMessage(
    tenantId: string,
    data: {
      executiveType: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, any>;
    },
  ) {
    const message = await this.prisma.executiveConversation.create({
      data: {
        tenantId,
        executiveType: data.executiveType.toUpperCase(),
        role: data.role,
        content: data.content,
        metadata: data.metadata || null,
      },
      select: {
        id: true,
        executiveType: true,
        role: true,
        content: true,
        metadata: true,
        createdAt: true,
      },
    });

    this.logger.log(
      `Saved ${data.role} message for ${data.executiveType} in tenant ${tenantId}`,
    );

    return message;
  }

  /**
   * Clear all conversation history for a specific executive
   * Used for "New Conversation" functionality
   */
  async clearConversation(tenantId: string, executiveType: string) {
    const result = await this.prisma.executiveConversation.deleteMany({
      where: {
        tenantId,
        executiveType: executiveType.toUpperCase(),
      },
    });

    this.logger.log(
      `Cleared ${result.count} messages for ${executiveType} in tenant ${tenantId}`,
    );

    return { cleared: result.count };
  }

  /**
   * Get recent conversation topics for cross-executive context
   * Returns brief summaries of last N messages for each executive
   */
  async getRecentTopics(tenantId: string, messageCount = 3) {
    const executives = ['DON', 'JORDAN', 'PAM', 'BEN', 'MIRANDA', 'TED', 'JARVIS'];
    const topics: Record<string, string[]> = {};

    for (const exec of executives) {
      const recentMessages = await this.prisma.executiveConversation.findMany({
        where: {
          tenantId,
          executiveType: exec,
          role: 'user', // Only user messages for topic extraction
        },
        orderBy: { createdAt: 'desc' },
        take: messageCount,
        select: {
          content: true,
        },
      });

      if (recentMessages.length > 0) {
        // Extract brief topic summaries (first 100 chars of each message)
        topics[exec] = recentMessages.map((m) =>
          m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content,
        );
      }
    }

    return topics;
  }
}
