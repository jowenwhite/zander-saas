import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../auth/jwt-auth.decorator';
import { EmailService } from '../integrations/email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeadSource, LeadStatus, ConsultingEventType } from '@prisma/client';
import * as crypto from 'crypto';

/**
 * Calendly Webhook Event Types
 * @see https://developer.calendly.com/api-docs/a29c16dd22e70-webhook-payload
 */
interface CalendlyWebhookPayload {
  event: 'invitee.created' | 'invitee.canceled';
  created_at: string;
  created_by: string;
  payload: {
    cancel_url?: string;
    created_at: string;
    email: string;
    event: string;
    first_name?: string;
    last_name?: string;
    name: string;
    new_invitee?: string;
    old_invitee?: string;
    questions_and_answers?: Array<{
      answer: string;
      position: number;
      question: string;
    }>;
    reschedule_url?: string;
    rescheduled: boolean;
    routing_form_submission?: string;
    status: 'active' | 'canceled';
    text_reminder_number?: string;
    timezone: string;
    tracking?: {
      utm_campaign?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_content?: string;
      utm_term?: string;
      salesforce_uuid?: string;
    };
    updated_at: string;
    uri: string;
    scheduled_event: {
      created_at: string;
      end_time: string;
      event_guests: Array<{
        created_at: string;
        email: string;
        updated_at: string;
      }>;
      event_memberships: Array<{
        user: string;
        user_email: string;
        user_name: string;
      }>;
      event_type: string;
      invitees_counter: {
        active: number;
        limit: number;
        total: number;
      };
      location?: {
        join_url?: string;
        location?: string;
        type: string;
        status?: string;
      };
      meeting_notes_html?: string;
      meeting_notes_plain?: string;
      name: string;
      start_time: string;
      status: 'active' | 'canceled';
      updated_at: string;
      uri: string;
    };
  };
}

@Controller('webhooks')
export class CalendlyWebhookController {
  private readonly logger = new Logger(CalendlyWebhookController.name);
  private readonly webhookSigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  /**
   * Handle Calendly webhook events
   * Endpoint: POST /webhooks/calendly
   */
  @Public()
  @Post('calendly')
  @HttpCode(HttpStatus.OK)
  async handleCalendlyWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: CalendlyWebhookPayload,
    @Headers('calendly-webhook-signature') signature: string,
  ) {
    this.logger.log(`Calendly webhook received: ${payload.event}`);

    // Verify webhook signature if signing key is configured
    if (this.webhookSigningKey && signature) {
      const isValid = this.verifySignature(req.rawBody, signature);
      if (!isValid) {
        this.logger.warn('Invalid Calendly webhook signature');
        return { received: true, error: 'Invalid signature' };
      }
    }

    try {
      switch (payload.event) {
        case 'invitee.created':
          await this.handleInviteeCreated(payload);
          break;

        case 'invitee.canceled':
          await this.handleInviteeCanceled(payload);
          break;

        default:
          this.logger.log(`Unhandled Calendly event: ${payload.event}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Calendly webhook error: ${error.message}`);
      return { received: true, error: error.message };
    }
  }

  /**
   * Verify Calendly webhook signature
   * @see https://developer.calendly.com/api-docs/ZG9jOjM2MzE2MDM4-webhook-signatures
   */
  private verifySignature(rawBody: Buffer | undefined, signature: string): boolean {
    if (!rawBody || !this.webhookSigningKey) return false;

    try {
      // Calendly signature format: t=timestamp,v1=signature
      const parts = signature.split(',');
      const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
      const v1Signature = parts.find(p => p.startsWith('v1='))?.slice(3);

      if (!timestamp || !v1Signature) return false;

      const signedPayload = `${timestamp}.${rawBody.toString()}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSigningKey)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(v1Signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  /**
   * Detect meeting platform from Calendly location data
   */
  private detectPlatformFromLocation(locationType?: string, joinUrl?: string): string {
    if (!locationType && !joinUrl) return 'unknown';

    const type = locationType?.toLowerCase() || '';
    const url = joinUrl?.toLowerCase() || '';

    if (type.includes('zoom') || url.includes('zoom.us')) return 'zoom';
    if (type.includes('google') || url.includes('meet.google')) return 'google_meet';
    if (type.includes('teams') || url.includes('teams.microsoft')) return 'teams';
    if (type.includes('webex') || url.includes('webex.com')) return 'webex';
    if (type === 'custom' || type === 'phone') return type;

    return 'other';
  }

  /**
   * Handle new call booking (invitee.created)
   * Creates or updates a ConsultingLead and logs the event
   */
  private async handleInviteeCreated(payload: CalendlyWebhookPayload) {
    const { payload: data } = payload;
    const event = data.scheduled_event;

    const inviteeName = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Guest';
    const inviteeEmail = data.email.toLowerCase();
    const eventName = event.name;
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const timezone = data.timezone;
    const calendlyEventUri = data.uri;

    // Extract Q&A responses if available
    const questionsAndAnswers = data.questions_and_answers || [];

    // Extract company from Q&A if present
    const companyAnswer = questionsAndAnswers.find(qa =>
      qa.question.toLowerCase().includes('company') ||
      qa.question.toLowerCase().includes('business')
    )?.answer;

    this.logger.log(`New call booked: ${inviteeName} (${inviteeEmail}) for ${eventName}`);

    // Find or create consulting lead
    let lead = await this.prisma.consultingLead.findFirst({
      where: {
        email: inviteeEmail,
        status: { notIn: [LeadStatus.WON, LeadStatus.LOST] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lead) {
      // Update existing lead
      lead = await this.prisma.consultingLead.update({
        where: { id: lead.id },
        data: {
          status: LeadStatus.MEETING_SCHEDULED,
          calendlyEventUri,
          meetingScheduledAt: startTime,
          company: companyAnswer || lead.company,
        },
      });
      this.logger.log(`Updated lead ${lead.id} with Calendly meeting`);
    } else {
      // Create new lead from Calendly
      lead = await this.prisma.consultingLead.create({
        data: {
          source: LeadSource.CALENDLY,
          status: LeadStatus.MEETING_SCHEDULED,
          name: inviteeName,
          email: inviteeEmail,
          company: companyAnswer,
          calendlyEventUri,
          meetingScheduledAt: startTime,
        },
      });
      this.logger.log(`Created new lead ${lead.id} from Calendly booking`);
    }

    // Log the meeting scheduled event
    await this.prisma.consultingEvent.create({
      data: {
        type: ConsultingEventType.MEETING_SCHEDULED,
        leadId: lead.id,
        description: `${eventName} scheduled for ${startTime.toLocaleDateString()}`,
        metadata: {
          eventName,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timezone,
          calendlyEventUri,
          meetingUrl: event.location?.join_url,
          questionsAndAnswers,
        },
        actorType: 'webhook',
      },
    });

    // C-2: Create MeetingRecord stub for meeting intelligence
    // This allows the recording to be linked when it becomes available
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    const platform = this.detectPlatformFromLocation(event.location?.type, event.location?.join_url);

    const meetingRecord = await this.prisma.meetingRecord.create({
      data: {
        tenant: { connect: { id: process.env.ZANDER_TENANT_ID || 'zander-consulting' } },
        lead: { connect: { id: lead.id } },
        title: `${eventName} - ${inviteeName}`,
        scheduledAt: startTime,
        durationMinutes,
        source: 'calendly',
        platform,
        attendees: [
          { name: inviteeName, email: inviteeEmail, role: 'client' },
          { name: 'Jonathan White', email: 'jonathan@zanderos.com', role: 'host' },
        ],
        transcriptStatus: 'pending',
        summaryStatus: 'pending',
        metadata: {
          calendlyEventUri,
          meetingUrl: event.location?.join_url,
          timezone,
          questionsAndAnswers,
          webhookSource: 'calendly_webhook',
        },
      },
    });

    this.logger.log(`Created MeetingRecord stub ${meetingRecord.id} for upcoming call`);

    // Send admin notification
    await this.sendCallBookedNotification({
      inviteeName,
      inviteeEmail,
      eventName,
      startTime,
      endTime,
      timezone,
      questionsAndAnswers,
      meetingUrl: event.location?.join_url,
      rescheduleUrl: data.reschedule_url,
      cancelUrl: data.cancel_url,
      leadId: lead.id,
    });
  }

  /**
   * Handle call cancellation (invitee.canceled)
   * Updates lead status and logs the event
   */
  private async handleInviteeCanceled(payload: CalendlyWebhookPayload) {
    const { payload: data } = payload;
    const event = data.scheduled_event;

    const inviteeName = data.name || 'Guest';
    const inviteeEmail = data.email.toLowerCase();
    const eventName = event.name;
    const startTime = new Date(event.start_time);
    const calendlyEventUri = data.uri;

    this.logger.log(`Call canceled: ${inviteeName} (${inviteeEmail}) for ${eventName}`);

    // Find and update lead if exists
    const lead = await this.prisma.consultingLead.findFirst({
      where: {
        OR: [
          { calendlyEventUri },
          { email: inviteeEmail, status: LeadStatus.MEETING_SCHEDULED },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lead) {
      // Revert to CONTACTED status (they were contacted via Calendly)
      await this.prisma.consultingLead.update({
        where: { id: lead.id },
        data: {
          status: LeadStatus.CONTACTED,
          meetingScheduledAt: null,
        },
      });

      // Log cancellation event
      await this.prisma.consultingEvent.create({
        data: {
          type: ConsultingEventType.MEETING_CANCELED,
          leadId: lead.id,
          description: `${eventName} canceled (was scheduled for ${startTime.toLocaleDateString()})`,
          metadata: {
            eventName,
            originalStartTime: startTime.toISOString(),
            calendlyEventUri,
          },
          actorType: 'webhook',
        },
      });

      // Update MeetingRecord if exists (mark as canceled)
      const meetingRecord = await this.prisma.meetingRecord.findFirst({
        where: {
          leadId: lead.id,
          scheduledAt: startTime,
          transcriptStatus: 'pending',
        },
      });

      if (meetingRecord) {
        await this.prisma.meetingRecord.update({
          where: { id: meetingRecord.id },
          data: {
            transcriptStatus: 'canceled',
            summaryStatus: 'canceled',
            metadata: {
              ...(meetingRecord.metadata as object || {}),
              canceledAt: new Date().toISOString(),
              canceledVia: 'calendly_webhook',
            },
          },
        });
        this.logger.log(`Updated MeetingRecord ${meetingRecord.id} as canceled`);
      }

      this.logger.log(`Updated lead ${lead.id} after Calendly cancellation`);
    }

    // Send admin notification
    await this.sendCallCanceledNotification({
      inviteeName,
      inviteeEmail,
      eventName,
      startTime,
      leadId: lead?.id,
    });
  }

  /**
   * Send notification email when a consulting call is booked
   */
  private async sendCallBookedNotification(data: {
    inviteeName: string;
    inviteeEmail: string;
    eventName: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    questionsAndAnswers: Array<{ question: string; answer: string }>;
    meetingUrl?: string;
    rescheduleUrl?: string;
    cancelUrl?: string;
    leadId?: string;
  }) {
    const formattedDate = data.startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    });

    const formattedTime = `${data.startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    })} - ${data.endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    })} ET`;

    const qaHtml = data.questionsAndAnswers.length > 0
      ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-top: 20px;">
          <tr>
            <td style="padding: 24px;">
              <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">Pre-Call Responses</p>
              ${data.questionsAndAnswers.map(qa => `
                <div style="margin-bottom: 16px;">
                  <p style="color: rgba(255, 255, 255, 0.6); font-size: 13px; margin: 0 0 4px;">${qa.question}</p>
                  <p style="color: #FFFFFF; font-size: 15px; margin: 0; font-weight: 500;">${qa.answer}</p>
                </div>
              `).join('')}
            </td>
          </tr>
        </table>
      `
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080A0F;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(180deg, #080A0F 0%, #0E1117 100%);">
              <!-- Header with Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 30px; border-bottom: 1px solid rgba(0, 207, 235, 0.2);">
                    <img src="https://app.zanderos.com/images/zander-logo-color.svg" alt="Zander" style="height: 36px; width: auto;">
                  </td>
                </tr>
              </table>

              <!-- Alert Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0 20px;">
                    <span style="display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #22C55E; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
                      📅 Call Booked
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 10px; line-height: 1.2;">
                ${data.eventName}
              </h1>
              <p style="color: #00CFEB; font-size: 18px; margin: 0 0 30px; font-weight: 600;">
                ${data.inviteeName}
              </p>

              <!-- Meeting Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 207, 235, 0.05); border: 1px solid rgba(0, 207, 235, 0.2); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Date</span>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 4px 0 0; font-weight: 600;">${formattedDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Time</span>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 4px 0 0; font-weight: 600;">${formattedTime}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</span>
                          <p style="color: #00CFEB; font-size: 16px; margin: 4px 0 0;">${data.inviteeEmail}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Invitee Timezone</span>
                          <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 4px 0 0;">${data.timezone}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${qaHtml}

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0;">
                    ${data.meetingUrl ? `
                    <a href="${data.meetingUrl}"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; margin-right: 10px; margin-bottom: 10px;">
                      Join Meeting
                    </a>
                    ` : ''}
                    <a href="mailto:${data.inviteeEmail}?subject=Re: ${data.eventName}"
                       style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #FFFFFF; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.2);">
                      Email ${data.inviteeName.split(' ')[0]}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="color: rgba(255, 255, 255, 0.35); font-size: 12px; margin: 0;">
                      Zander Systems — Calendly Notification
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: 'jonathan@zanderos.com',
      subject: `📅 Call Booked: ${data.inviteeName} — ${data.eventName}`,
      html,
      from: 'Zander System <noreply@zanderos.com>',
      replyTo: data.inviteeEmail,
    });

    this.logger.log(`Call booked notification sent to jonathan@zanderos.com`);
  }

  /**
   * Send notification email when a call is canceled
   */
  private async sendCallCanceledNotification(data: {
    inviteeName: string;
    inviteeEmail: string;
    eventName: string;
    startTime: Date;
    leadId?: string;
  }) {
    const formattedDate = data.startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    });

    const formattedTime = data.startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080A0F;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(180deg, #080A0F 0%, #0E1117 100%);">
              <!-- Header with Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 30px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                    <img src="https://app.zanderos.com/images/zander-logo-color.svg" alt="Zander" style="height: 36px; width: auto;">
                  </td>
                </tr>
              </table>

              <!-- Alert Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0 20px;">
                    <span style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #EF4444; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
                      ❌ Call Canceled
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Content -->
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 10px; line-height: 1.2;">
                ${data.eventName}
              </h1>
              <p style="color: #EF4444; font-size: 18px; margin: 0 0 30px; font-weight: 600;">
                Canceled by ${data.inviteeName}
              </p>

              <!-- Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Originally Scheduled</span>
                          <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; margin: 4px 0 0; text-decoration: line-through;">${formattedDate} at ${formattedTime} ET</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Contact</span>
                          <p style="color: #00CFEB; font-size: 16px; margin: 4px 0 0;">${data.inviteeEmail}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0;">
                    <a href="mailto:${data.inviteeEmail}?subject=Following up on our call"
                       style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #FFFFFF; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.2);">
                      Follow Up with ${data.inviteeName.split(' ')[0]}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="color: rgba(255, 255, 255, 0.35); font-size: 12px; margin: 0;">
                      Zander Systems — Calendly Notification
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: 'jonathan@zanderos.com',
      subject: `❌ Call Canceled: ${data.inviteeName} — ${data.eventName}`,
      html,
      from: 'Zander System <noreply@zanderos.com>',
    });

    this.logger.log(`Call canceled notification sent to jonathan@zanderos.com`);
  }
}
