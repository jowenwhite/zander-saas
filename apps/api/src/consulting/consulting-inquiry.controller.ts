import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../auth/jwt-auth.decorator';
import { EmailService } from '../integrations/email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LeadSource, ConsultingEventType } from '@prisma/client';

/**
 * DTO for consulting inquiry submission
 */
export class ConsultingInquiryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  interestedPackage?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}

@Controller('consulting')
export class ConsultingInquiryController {
  private readonly logger = new Logger(ConsultingInquiryController.name);

  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  /**
   * Handle consulting inquiry form submission
   * Creates a ConsultingLead, logs event, and sends notification emails
   */
  @Public()
  @Post('inquiry')
  @HttpCode(HttpStatus.OK)
  async submitInquiry(@Body() dto: ConsultingInquiryDto) {
    this.logger.log(`New consulting inquiry from: ${dto.name} (${dto.email})`);

    try {
      // Check if lead already exists with this email
      const existingLead = await this.prisma.consultingLead.findFirst({
        where: {
          email: dto.email.toLowerCase(),
          status: { notIn: ['WON', 'LOST'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      let lead;

      if (existingLead) {
        // Update existing lead with new message/info
        lead = await this.prisma.consultingLead.update({
          where: { id: existingLead.id },
          data: {
            message: dto.message,
            interestedPackage: dto.interestedPackage || existingLead.interestedPackage,
            company: dto.company || existingLead.company,
            phone: dto.phone || existingLead.phone,
          },
        });
        this.logger.log(`Updated existing lead ${lead.id} with new inquiry`);
      } else {
        // Create new lead
        lead = await this.prisma.consultingLead.create({
          data: {
            source: LeadSource.INQUIRY,
            name: dto.name,
            email: dto.email.toLowerCase(),
            company: dto.company,
            phone: dto.phone,
            interestedPackage: dto.interestedPackage,
            message: dto.message,
          },
        });
        this.logger.log(`Created new lead ${lead.id} from inquiry`);
      }

      // Log the inquiry event
      await this.prisma.consultingEvent.create({
        data: {
          type: ConsultingEventType.INQUIRY_RECEIVED,
          leadId: lead.id,
          description: `Inquiry received via consulting form${dto.interestedPackage ? ` - interested in ${dto.interestedPackage}` : ''}`,
          metadata: {
            name: dto.name,
            email: dto.email,
            company: dto.company,
            phone: dto.phone,
            interestedPackage: dto.interestedPackage,
            messagePreview: dto.message.substring(0, 200),
            isExistingLead: !!existingLead,
          },
          actorType: 'webhook',
        },
      });

      // Send admin notification
      await this.sendInquiryNotification(dto, lead.id);

      // Send auto-response to customer
      await this.sendInquiryAutoResponse(dto);

      return {
        success: true,
        message: 'Thank you for your inquiry. Jonathan will be in touch within 24 hours.',
        leadId: lead.id,
      };
    } catch (error) {
      this.logger.error(`Failed to process inquiry: ${error.message}`);
      return {
        success: false,
        message: 'There was an issue submitting your inquiry. Please email jonathan@zanderos.com directly.',
      };
    }
  }

  /**
   * Send notification email to Jonathan for new consulting inquiry
   */
  private async sendInquiryNotification(dto: ConsultingInquiryDto, leadId?: string) {
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
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
                  <td style="padding-bottom: 30px; border-bottom: 1px solid rgba(0, 207, 235, 0.2);">
                    <img src="https://app.zanderos.com/images/zander-logo-color.svg" alt="Zander" style="height: 36px; width: auto;">
                  </td>
                </tr>
              </table>

              <!-- Alert Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0 20px;">
                    <span style="display: inline-block; background: rgba(0, 207, 235, 0.15); border: 1px solid rgba(0, 207, 235, 0.4); color: #00CFEB; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
                      📬 New Consulting Inquiry
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 10px; line-height: 1.2;">
                ${dto.name}
              </h1>
              <p style="color: #00CFEB; font-size: 16px; margin: 0 0 30px;">
                ${dto.email}
              </p>

              <!-- Info Cards -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${dto.company ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Company</span>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${dto.company}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${dto.phone ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</span>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${dto.phone}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${dto.interestedPackage ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Interested In</span>
                          <p style="color: #00CFEB; font-size: 16px; margin: 4px 0 0; font-weight: 600;">${dto.interestedPackage}</p>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Received</span>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 4px 0 0; font-weight: 500;">${timestamp}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 207, 235, 0.05); border: 1px solid rgba(0, 207, 235, 0.2); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;">Message</p>
                    <p style="color: #FFFFFF; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${dto.message}</p>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0;">
                    <a href="mailto:${dto.email}?subject=Re: Consulting Inquiry — ${dto.name}&body=Hi ${dto.name},%0A%0AThank you for reaching out about Zander consulting.%0A%0A"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                      Reply to ${dto.name}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="color: rgba(255, 255, 255, 0.35); font-size: 12px; margin: 0;">
                      Zander Systems — Consulting Inquiry Notification
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
      subject: `📬 New Inquiry: ${dto.name}${dto.interestedPackage ? ` — ${dto.interestedPackage}` : ''}`,
      html,
      from: 'Zander System <noreply@zanderos.com>',
      replyTo: dto.email,
    });

    this.logger.log(`Inquiry notification sent to jonathan@zanderos.com for ${dto.email}`);
  }

  /**
   * Send auto-response to the customer
   */
  private async sendInquiryAutoResponse(dto: ConsultingInquiryDto) {
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

              <!-- Main Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 0;">
                    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.2;">
                      Thanks for reaching out, ${dto.name.split(' ')[0]}
                    </h1>

                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                      I received your inquiry and will personally review it within the next 24 hours.
                    </p>

                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                      In the meantime, if you'd like to schedule a discovery call right away, you can book directly on my calendar:
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 20px 0;">
                          <a href="https://calendly.com/jonathan-zanderos/discovery-call"
                             style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                            Book a Discovery Call
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                      I look forward to learning more about your business and how we can work together.
                    </p>

                    <!-- Signature -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                      <tr>
                        <td>
                          <p style="color: #FFFFFF; font-size: 16px; margin: 0;">
                            <strong>Jonathan White</strong>
                          </p>
                          <p style="color: #00CFEB; font-size: 14px; margin: 4px 0 0;">
                            Founder, Zander
                          </p>
                          <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 8px 0 0;">
                            jonathan@zanderos.com
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="color: rgba(255, 255, 255, 0.35); font-size: 12px; margin: 0; text-align: center;">
                      Zander Systems — Operating Simply<br>
                      <a href="https://zanderos.com" style="color: rgba(255, 255, 255, 0.35); text-decoration: none;">zanderos.com</a>
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
      to: dto.email,
      subject: 'Thanks for reaching out — Zander Consulting',
      html,
      from: 'Jonathan from Zander <jonathan@zanderos.com>',
      replyTo: 'jonathan@zanderos.com',
    });

    this.logger.log(`Auto-response sent to ${dto.email}`);
  }
}
