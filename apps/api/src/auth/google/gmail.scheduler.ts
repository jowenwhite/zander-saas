import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { GmailService } from './gmail.service';

@Injectable()
export class GmailScheduler {
  private readonly logger = new Logger(GmailScheduler.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gmailService: GmailService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async syncAllUsersGmail() {
    // Prevent overlapping runs
    if (this.isRunning) {
      this.logger.warn('Gmail sync already in progress, skipping this run');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting scheduled Gmail sync for all users...');

    try {
      // Fetch all users who have a valid GoogleToken
      const usersWithGmail = await this.prisma.googleToken.findMany({
        select: {
          userId: true,
          email: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Found ${usersWithGmail.length} users with Gmail connected`);

      let successCount = 0;
      let errorCount = 0;

      for (const token of usersWithGmail) {
        try {
          const result = await this.gmailService.syncEmails(token.userId, 20); // Limit to 20 per user per sync
          this.logger.log(
            `[${token.email}] Synced ${result.synced} emails, ${result.errors} errors`,
          );
          successCount++;
        } catch (error) {
          this.logger.error(
            `[${token.email}] Gmail sync failed: ${error.message}`,
          );
          errorCount++;

          // If token is invalid/expired, log but don't crash
          if (error.message?.includes('invalid_grant') || error.message?.includes('Token')) {
            this.logger.warn(
              `[${token.email}] Token may be expired - user needs to re-authenticate`,
            );
          }
        }
      }

      this.logger.log(
        `Scheduled Gmail sync complete: ${successCount} successful, ${errorCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Gmail scheduler error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
