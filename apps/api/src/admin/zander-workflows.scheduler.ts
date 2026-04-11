import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

interface WorkflowResult {
  workflow: string;
  executedAt: Date;
  tenantsProcessed: number;
  draftsCreated: number;
  alertsGenerated: number;
  errors: string[];
}

@Injectable()
export class ZanderWorkflowsScheduler {
  private readonly logger = new Logger(ZanderWorkflowsScheduler.name);
  private isRunning = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nightly Workflows - runs at 11 PM EST
   * Identifies action opportunities for Jonathan to review in the morning
   */
  @Cron('0 23 * * *', { timeZone: 'America/New_York' })
  async runNightlyWorkflows() {
    if (this.isRunning) {
      this.logger.warn('Nightly workflows already in progress, skipping');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting Zander nightly workflows...');

    const results: WorkflowResult[] = [];

    try {
      // Run all workflows in sequence
      results.push(await this.churnRiskMitigation());
      results.push(await this.powerUserUpgrades());
      results.push(await this.trialExpirationWarnings());
      results.push(await this.systemHealthAlerts());

      // Log summary
      const totalDrafts = results.reduce((sum, r) => sum + r.draftsCreated, 0);
      const totalAlerts = results.reduce((sum, r) => sum + r.alertsGenerated, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

      this.logger.log(
        `Nightly workflows complete: ${totalDrafts} drafts, ${totalAlerts} alerts, ${totalErrors} errors`,
      );

      // Store workflow results for morning briefing
      await this.storeWorkflowResults(results);
    } catch (error) {
      this.logger.error(`Nightly workflows failed: ${error.message}`, error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Morning Briefing - runs at 7 AM EST
   * Creates a summary of overnight activity and pending actions
   */
  @Cron('0 7 * * *', { timeZone: 'America/New_York' })
  async morningBriefing() {
    this.logger.log('Generating morning briefing...');

    try {
      const briefing = await this.generateMorningBriefing();

      // Store briefing as a system config
      await this.prisma.systemConfig.upsert({
        where: { key: 'morning_briefing_latest' },
        update: {
          value: JSON.stringify(briefing),
          updatedAt: new Date(),
        },
        create: {
          key: 'morning_briefing_latest',
          value: JSON.stringify(briefing),
          category: 'zander_workflows',
        },
      });

      this.logger.log('Morning briefing generated successfully');
    } catch (error) {
      this.logger.error(`Morning briefing failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Churn Risk Mitigation Workflow
   * Identifies at-risk tenants and creates draft reactivation emails
   */
  private async churnRiskMitigation(): Promise<WorkflowResult> {
    this.logger.log('Running churn risk mitigation workflow...');

    const result: WorkflowResult = {
      workflow: 'churn_risk_mitigation',
      executedAt: new Date(),
      tenantsProcessed: 0,
      draftsCreated: 0,
      alertsGenerated: 0,
      errors: [],
    };

    try {
      // Find tenants at risk (HIGH or CRITICAL churn risk, or inactive 14-30 days)
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const atRiskTenants = await this.prisma.tenant.findMany({
        where: {
          archivedAt: null,
          subscriptionStatus: { in: ['active', 'trial'] },
          OR: [
            { currentChurnRiskLevel: { in: ['HIGH', 'CRITICAL'] } },
            {
              lastActivityAt: {
                gte: thirtyDaysAgo,
                lte: fourteenDaysAgo,
              },
            },
          ],
        },
        select: {
          id: true,
          companyName: true,
          lastActivityAt: true,
          currentEngagementScore: true,
          currentChurnRiskLevel: true,
          users: {
            where: { role: 'owner' },
            take: 1,
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      result.tenantsProcessed = atRiskTenants.length;
      this.logger.log(`Found ${atRiskTenants.length} at-risk tenants`);

      for (const tenant of atRiskTenants) {
        try {
          const ownerEmail = tenant.users[0]?.email;
          const ownerName = tenant.users[0]?.firstName || tenant.companyName;

          // Check if we already have a pending draft for this tenant
          const existingDraft = await this.prisma.scheduledCommunication.findFirst({
            where: {
              recipientEmail: ownerEmail,
              status: 'pending',
              subject: { contains: 'check in' },
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          });

          if (existingDraft) {
            this.logger.log(`Skipping ${tenant.companyName} - draft already exists`);
            continue;
          }

          if (ownerEmail) {
            await this.prisma.scheduledCommunication.create({
              data: {
                tenantId: tenant.id,
                type: 'email',
                recipientEmail: ownerEmail,
                recipientName: ownerName,
                subject: `Quick check in from Zander - ${tenant.companyName}`,
                body: this.generateReactivationEmail(ownerName, tenant.companyName, tenant.lastActivityAt),
                status: 'pending',
                needsApproval: true,
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                createdBy: 'zander_workflow',
              },
            });
            result.draftsCreated++;
          }
        } catch (error) {
          result.errors.push(`${tenant.companyName}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Workflow error: ${error.message}`);
    }

    return result;
  }

  /**
   * Power User Upgrades Workflow
   * Identifies highly engaged tenants and creates draft upgrade offers
   */
  private async powerUserUpgrades(): Promise<WorkflowResult> {
    this.logger.log('Running power user upgrades workflow...');

    const result: WorkflowResult = {
      workflow: 'power_user_upgrades',
      executedAt: new Date(),
      tenantsProcessed: 0,
      draftsCreated: 0,
      alertsGenerated: 0,
      errors: [],
    };

    try {
      // Find power users (high engagement, active recently, not enterprise)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const powerUsers = await this.prisma.tenant.findMany({
        where: {
          archivedAt: null,
          subscriptionStatus: 'active',
          subscriptionTier: { in: ['STARTER', 'PRO'] }, // Not already enterprise
          currentEngagementScore: { gte: 50 },
          currentChurnRiskLevel: 'LOW',
          lastActivityAt: { gte: sevenDaysAgo },
        },
        select: {
          id: true,
          companyName: true,
          subscriptionTier: true,
          currentEngagementScore: true,
          users: {
            where: { role: 'owner' },
            take: 1,
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      result.tenantsProcessed = powerUsers.length;
      this.logger.log(`Found ${powerUsers.length} power users for upgrade consideration`);

      for (const tenant of powerUsers) {
        try {
          const ownerEmail = tenant.users[0]?.email;
          const ownerName = tenant.users[0]?.firstName || tenant.companyName;

          // Check if we already sent an upgrade offer in the last 30 days
          const existingOffer = await this.prisma.scheduledCommunication.findFirst({
            where: {
              recipientEmail: ownerEmail,
              subject: { contains: 'upgrade' },
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          });

          if (existingOffer) {
            continue;
          }

          if (ownerEmail) {
            await this.prisma.scheduledCommunication.create({
              data: {
                tenantId: tenant.id,
                type: 'email',
                recipientEmail: ownerEmail,
                recipientName: ownerName,
                subject: `You're a power user, ${ownerName} - unlock more with Zander`,
                body: this.generateUpgradeOfferEmail(ownerName, tenant.subscriptionTier),
                status: 'pending',
                needsApproval: true,
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
                createdBy: 'zander_workflow',
              },
            });
            result.draftsCreated++;
          }
        } catch (error) {
          result.errors.push(`${tenant.companyName}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Workflow error: ${error.message}`);
    }

    return result;
  }

  /**
   * Trial Expiration Warnings Workflow
   * Identifies trials expiring in the next 7 days and creates alerts
   */
  private async trialExpirationWarnings(): Promise<WorkflowResult> {
    this.logger.log('Running trial expiration warnings workflow...');

    const result: WorkflowResult = {
      workflow: 'trial_expiration_warnings',
      executedAt: new Date(),
      tenantsProcessed: 0,
      draftsCreated: 0,
      alertsGenerated: 0,
      errors: [],
    };

    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const expiringTrials = await this.prisma.tenant.findMany({
        where: {
          archivedAt: null,
          subscriptionStatus: 'trial',
          trialEndsAt: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        select: {
          id: true,
          companyName: true,
          trialEndsAt: true,
          currentEngagementScore: true,
          users: {
            where: { role: 'owner' },
            take: 1,
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      result.tenantsProcessed = expiringTrials.length;
      this.logger.log(`Found ${expiringTrials.length} trials expiring in next 7 days`);

      for (const tenant of expiringTrials) {
        try {
          const daysLeft = Math.ceil(
            (tenant.trialEndsAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
          );

          // Create alert for Jonathan (stored as action log)
          await this.prisma.zanderActionLog.create({
            data: {
              action: 'trial_expiring_alert',
              level: daysLeft <= 3 ? 'L2' : 'L1',
              input: {
                tenantId: tenant.id,
                tenantName: tenant.companyName,
                daysLeft,
                trialEndsAt: tenant.trialEndsAt,
                ownerEmail: tenant.users[0]?.email,
                engagement: tenant.currentEngagementScore,
              },
              success: true,
              tenantId: tenant.id,
              executedAt: new Date(),
            },
          });
          result.alertsGenerated++;

          // If 3 days or less and engaged, create draft conversion email
          if (daysLeft <= 3 && (tenant.currentEngagementScore || 0) >= 30) {
            const ownerEmail = tenant.users[0]?.email;
            const ownerName = tenant.users[0]?.firstName || tenant.companyName;

            if (ownerEmail) {
              await this.prisma.scheduledCommunication.create({
                data: {
                  tenantId: tenant.id,
                  type: 'email',
                  recipientEmail: ownerEmail,
                  recipientName: ownerName,
                  subject: `Your Zander trial ends in ${daysLeft} days`,
                  body: this.generateTrialExpirationEmail(ownerName, daysLeft),
                  status: 'pending',
                  needsApproval: true,
                  scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
                  createdBy: 'zander_workflow',
                },
              });
              result.draftsCreated++;
            }
          }
        } catch (error) {
          result.errors.push(`${tenant.companyName}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Workflow error: ${error.message}`);
    }

    return result;
  }

  /**
   * System Health Alerts Workflow
   * Checks system health metrics and creates alerts for issues
   */
  private async systemHealthAlerts(): Promise<WorkflowResult> {
    this.logger.log('Running system health alerts workflow...');

    const result: WorkflowResult = {
      workflow: 'system_health_alerts',
      executedAt: new Date(),
      tenantsProcessed: 0,
      draftsCreated: 0,
      alertsGenerated: 0,
      errors: [],
    };

    try {
      // Check recent error rate
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentErrors = await this.prisma.errorLog.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      });

      // Check if any tenants have critical issues
      const criticalTenants = await this.prisma.tenant.count({
        where: {
          archivedAt: null,
          currentChurnRiskLevel: 'CRITICAL',
        },
      });

      // Get latest health snapshot
      const latestHealth = await this.prisma.systemHealthSnapshot.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Create alerts based on thresholds
      if (recentErrors > 50) {
        await this.prisma.zanderActionLog.create({
          data: {
            action: 'high_error_rate_alert',
            level: 'L2',
            input: {
              errorCount: recentErrors,
              timeWindow: '1 hour',
              threshold: 50,
            },
            success: true,
            executedAt: new Date(),
          },
        });
        result.alertsGenerated++;
      }

      if (criticalTenants > 0) {
        await this.prisma.zanderActionLog.create({
          data: {
            action: 'critical_churn_risk_alert',
            level: 'L2',
            input: {
              criticalCount: criticalTenants,
            },
            success: true,
            executedAt: new Date(),
          },
        });
        result.alertsGenerated++;
      }

      if (latestHealth && latestHealth.apiResponseTime > 2000) {
        await this.prisma.zanderActionLog.create({
          data: {
            action: 'slow_response_time_alert',
            level: 'L1',
            input: {
              responseTime: latestHealth.apiResponseTime,
              threshold: 2000,
            },
            success: true,
            executedAt: new Date(),
          },
        });
        result.alertsGenerated++;
      }

      this.logger.log(`System health check complete: ${result.alertsGenerated} alerts generated`);
    } catch (error) {
      result.errors.push(`Workflow error: ${error.message}`);
    }

    return result;
  }

  /**
   * Store workflow results for morning briefing
   */
  private async storeWorkflowResults(results: WorkflowResult[]) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'nightly_workflow_results' },
      update: {
        value: JSON.stringify({
          executedAt: new Date(),
          results,
        }),
        updatedAt: new Date(),
      },
      create: {
        key: 'nightly_workflow_results',
        value: JSON.stringify({
          executedAt: new Date(),
          results,
        }),
        category: 'zander_workflows',
      },
    });
  }

  /**
   * Generate morning briefing summary
   */
  private async generateMorningBriefing() {
    const now = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get pending drafts count
    const pendingDrafts = await this.prisma.scheduledCommunication.count({
      where: { status: 'pending', needsApproval: true },
    });

    // Get new signups
    const newSignups = await this.prisma.tenant.count({
      where: { createdAt: { gte: yesterday } },
    });

    // Get new waitlist entries
    const newWaitlist = await this.prisma.waitlistEntry.count({
      where: { createdAt: { gte: yesterday } },
    });

    // Get critical alerts (L2 level actions from yesterday)
    const criticalAlerts = await this.prisma.zanderActionLog.count({
      where: {
        level: 'L2',
        executedAt: { gte: yesterday },
      },
    });

    // Get workflow results
    const workflowResults = await this.prisma.systemConfig.findUnique({
      where: { key: 'nightly_workflow_results' },
    });

    return {
      date: now.toISOString().split('T')[0],
      summary: {
        pendingDrafts,
        newSignups,
        newWaitlist,
        criticalAlerts,
      },
      workflowResults: workflowResults ? JSON.parse(String(workflowResults.value)) : null,
      generatedAt: now.toISOString(),
    };
  }

  // Email template generators
  private generateReactivationEmail(name: string, company: string, lastActivity: Date | null): string {
    const daysSince = lastActivity
      ? Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
      : 'several';

    return `Hi ${name},

I noticed it's been ${daysSince} days since ${company} logged into Zander, and I wanted to check in.

Is there anything I can help with? Whether it's:
- A quick refresher on features
- Connecting integrations
- Answering questions about your account

I'm here to make sure you're getting value from Zander.

Just reply to this email or book a quick call with me: https://calendly.com/jonathan-zanderos

Best,
Jonathan
Zander OS`;
  }

  private generateUpgradeOfferEmail(name: string, currentTier: string): string {
    const nextTier = currentTier === 'STARTER' ? 'Pro' : 'Enterprise';

    return `Hi ${name},

You're crushing it on Zander! Your engagement is in the top tier of our users, and I think you might be ready for more.

${nextTier} unlocks:
- More AI executive capacity
- Priority support
- Advanced analytics
- Custom integrations

As one of our most engaged users, I'd love to offer you a special upgrade path. Want to hop on a quick call to see if ${nextTier} makes sense for you?

Book a time here: https://calendly.com/jonathan-zanderos

Best,
Jonathan
Zander OS`;
  }

  private generateTrialExpirationEmail(name: string, daysLeft: number): string {
    return `Hi ${name},

Your Zander trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!

I've seen some great engagement from your team, and I'd hate for you to lose momentum.

Here's what happens next:
- Your data stays safe (we don't delete anything)
- You can upgrade anytime to keep full access
- Or we can extend your trial if you need more time

Let me know what works best for you - just reply to this email or book a call:
https://calendly.com/jonathan-zanderos

Best,
Jonathan
Zander OS`;
  }
}
