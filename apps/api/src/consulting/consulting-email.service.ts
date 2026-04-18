import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../integrations/email/email.service';
import { getEmailSignatureDark, wrapEmailContent } from '../shared/email-signature';

/**
 * Consulting Email Service
 *
 * Handles all consulting lifecycle emails:
 * - Welcome emails after payment
 * - Contract ready notifications
 * - Contract signed confirmations
 * - Intake available notifications
 * - Deliverable ready notifications
 * - Hours low warnings
 * - Engagement expiring warnings
 *
 * All emails use Zander dark branding with cyan accents
 * and include the universal email signature.
 */
@Injectable()
export class ConsultingEmailService {
  private readonly logger = new Logger(ConsultingEmailService.name);

  constructor(private emailService: EmailService) {}

  // ============================================
  // PACKAGE NAME HELPERS
  // ============================================

  private getPackageName(packageType: string): string {
    const names: Record<string, string> = {
      BUSINESS_ANALYSIS: 'Comprehensive Business Analysis',
      COMPASS: 'Compass Package',
      FOUNDATION: 'Foundation Package',
      BLUEPRINT: 'Blueprint Package',
    };
    return names[packageType] || packageType;
  }

  // ============================================
  // 1. WELCOME EMAIL
  // ============================================

  /**
   * Send welcome email after consulting payment confirmed
   */
  async sendWelcomeEmail(
    clientEmail: string,
    clientName: string,
    packageName: string,
    loginUrl: string = 'https://app.zanderos.com/login',
  ): Promise<void> {
    try {
      const displayPackage = this.getPackageName(packageName);

      const bodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.2;">
                Welcome to Zander Consulting
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Thank you for choosing Zander for your <strong style="color: #00CFEB;">${displayPackage}</strong> engagement.
                I'm excited to work with you and help your business operate simply and scale efficiently.
              </p>

              <!-- Package Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 207, 235, 0.1); border: 1px solid rgba(0, 207, 235, 0.3); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #00CFEB; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 15px;">
                      Your Engagement
                    </p>
                    <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px;">
                      ${displayPackage}
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 0;">
                      Valid for 6 months from purchase
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 15px;">
                      What Happens Next:
                    </p>
                    <ol style="color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>I'll reach out within 24 hours to schedule our kickoff call</li>
                      <li>Access your dashboard to complete the intake survey</li>
                      <li>We begin working together on your business operations</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <a href="${loginUrl}"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                      Access Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 20px 0 0;">
                I look forward to our partnership.
              </p>
            </td>
          </tr>
        </table>
      `;

      const html = wrapEmailContent(bodyContent, { theme: 'dark' });

      await this.emailService.sendEmail({
        to: clientEmail,
        subject: `Welcome to Zander Consulting — Your ${displayPackage} Engagement`,
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      this.logger.log(`Welcome email sent to ${clientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }

  // ============================================
  // 2. CONTRACT READY EMAIL
  // ============================================

  /**
   * Send notification that a contract is ready for signature
   */
  async sendContractReadyEmail(
    clientEmail: string,
    clientName: string,
    documentType: string,
    signUrl: string,
  ): Promise<void> {
    try {
      const docTypeDisplay = this.getDocumentTypeDisplay(documentType);

      const bodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <span style="display: inline-block; background: rgba(0, 207, 235, 0.15); border: 1px solid rgba(0, 207, 235, 0.4); color: #00CFEB; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
                Document Ready for Signature
              </span>

              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 20px 0 20px; line-height: 1.2;">
                Your ${docTypeDisplay} is Ready
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Your <strong style="color: #00CFEB;">${docTypeDisplay}</strong> is ready for review and signature.
                Please click the button below to access the document.
              </p>

              <!-- Document Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
                      Document Type
                    </p>
                    <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0;">
                      ${docTypeDisplay}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <a href="${signUrl}"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                      Review & Sign Document
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 20px 0 0;">
                Questions about this document? Simply reply to this email.
              </p>
            </td>
          </tr>
        </table>
      `;

      const html = wrapEmailContent(bodyContent, { theme: 'dark' });

      await this.emailService.sendEmail({
        to: clientEmail,
        subject: `Your ${docTypeDisplay} is Ready for Review — Zander Consulting`,
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      this.logger.log(`Contract ready email sent to ${clientEmail} for ${documentType}`);
    } catch (error) {
      this.logger.error(`Failed to send contract ready email: ${error.message}`);
    }
  }

  private getDocumentTypeDisplay(type: string): string {
    const types: Record<string, string> = {
      NDA: 'Non-Disclosure Agreement',
      CSA: 'Consulting Services Agreement',
      SOW: 'Statement of Work',
      INVOICE: 'Invoice',
    };
    return types[type] || type;
  }

  // ============================================
  // 3. CONTRACT SIGNED EMAIL
  // ============================================

  /**
   * Send confirmation that document is fully signed
   */
  async sendContractSignedEmail(
    clientEmail: string,
    clientName: string,
    zanderEmail: string,
    documentType: string,
  ): Promise<void> {
    try {
      const docTypeDisplay = this.getDocumentTypeDisplay(documentType);

      const bodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <span style="display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
                Fully Executed
              </span>

              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 20px 0 20px; line-height: 1.2;">
                ${docTypeDisplay} Signed
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Great news! Your <strong style="color: #00CFEB;">${docTypeDisplay}</strong> has been signed by both parties and is now fully executed.
              </p>

              <!-- Confirmation Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #10B981; font-size: 36px; margin: 0 0 10px;">
                      ✓
                    </p>
                    <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0;">
                      Document Fully Executed
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 10px 0 0;">
                      A copy is available in your dashboard
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 20px 0;">
                The signed document is stored securely in your Zander dashboard. You can access it anytime.
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 20px 0 0;">
                Let's move forward!
              </p>
            </td>
          </tr>
        </table>
      `;

      const html = wrapEmailContent(bodyContent, { theme: 'dark' });

      // Send to both client and Jonathan
      await Promise.all([
        this.emailService.sendEmail({
          to: clientEmail,
          subject: `Fully Executed ${docTypeDisplay} — Zander Consulting`,
          html,
          from: 'Zander <noreply@zanderos.com>',
          replyTo: 'jonathan@zanderos.com',
        }),
        this.emailService.sendEmail({
          to: zanderEmail,
          subject: `[SIGNED] ${docTypeDisplay} — ${clientName}`,
          html: `<div style="font-family: -apple-system, sans-serif; padding: 20px;">
            <h2 style="color: #10B981;">Document Signed</h2>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Document:</strong> ${docTypeDisplay}</p>
            <p><strong>Status:</strong> Fully Executed</p>
          </div>`,
          from: 'Zander System <noreply@zanderos.com>',
        }),
      ]);

      this.logger.log(`Contract signed emails sent for ${clientName} - ${documentType}`);
    } catch (error) {
      this.logger.error(`Failed to send contract signed email: ${error.message}`);
    }
  }

  // ============================================
  // 4. INTAKE AVAILABLE EMAIL
  // ============================================

  /**
   * Send notification that intake survey is ready
   */
  async sendIntakeAvailableEmail(
    clientEmail: string,
    clientName: string,
    intakeUrl: string,
  ): Promise<void> {
    try {
      const bodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.2;">
                Your Business Analysis Intake is Ready
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                To get the most out of our consulting engagement, please complete the business intake survey.
                This helps me understand your operations, challenges, and goals.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 15px;">
                      What's Covered:
                    </p>
                    <ul style="color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Business overview and history</li>
                      <li>Current operations and processes</li>
                      <li>Challenges and pain points</li>
                      <li>Goals and desired outcomes</li>
                    </ul>
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 15px 0 0;">
                      Estimated time: 15-20 minutes
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <a href="${intakeUrl}"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                      Complete Intake Survey
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 20px 0 0;">
                Your responses are confidential and will only be used to improve our consulting work together.
              </p>
            </td>
          </tr>
        </table>
      `;

      const html = wrapEmailContent(bodyContent, { theme: 'dark' });

      await this.emailService.sendEmail({
        to: clientEmail,
        subject: 'Your Business Analysis Intake is Ready — Zander Consulting',
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      this.logger.log(`Intake available email sent to ${clientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send intake available email: ${error.message}`);
    }
  }

  // ============================================
  // 5. DELIVERABLE READY EMAIL
  // ============================================

  /**
   * Send notification that a deliverable is ready
   */
  async sendDeliverableReadyEmail(
    clientEmail: string,
    clientName: string,
    deliverableName: string,
  ): Promise<void> {
    try {
      const dashboardUrl = 'https://app.zanderos.com/headquarters';

      const bodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <span style="display: inline-block; background: rgba(0, 207, 235, 0.15); border: 1px solid rgba(0, 207, 235, 0.4); color: #00CFEB; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
                New Deliverable Ready
              </span>

              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 20px 0 20px; line-height: 1.2;">
                ${deliverableName}
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Great news! Your deliverable <strong style="color: #00CFEB;">"${deliverableName}"</strong> is now ready for review.
              </p>

              <!-- Deliverable Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 207, 235, 0.1); border: 1px solid rgba(0, 207, 235, 0.3); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
                      Deliverable
                    </p>
                    <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0;">
                      ${deliverableName}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <a href="${dashboardUrl}"
                       style="display: inline-block; background: #00CFEB; color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 20px 0 0;">
                Let me know if you have any questions or feedback.
              </p>
            </td>
          </tr>
        </table>
      `;

      const html = wrapEmailContent(bodyContent, { theme: 'dark' });

      await this.emailService.sendEmail({
        to: clientEmail,
        subject: `New Deliverable Ready — ${deliverableName}`,
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      this.logger.log(`Deliverable ready email sent to ${clientEmail} for "${deliverableName}"`);
    } catch (error) {
      this.logger.error(`Failed to send deliverable ready email: ${error.message}`);
    }
  }

  // ============================================
  // 6. HOURS LOW EMAIL
  // ============================================

  /**
   * Send warning that consulting hours are running low
   */
  async sendHoursLowEmail(
    clientEmail: string,
    clientName: string,
    hoursRemaining: number,
    totalHours: number,
    packageName: string,
  ): Promise<void> {
    try {
      const displayPackage = this.getPackageName(packageName);
      const percentUsed = Math.round(((totalHours - hoursRemaining) / totalHours) * 100);

      // Client email
      const clientBodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #F59E0B; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
                Hours Update
              </span>

              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 20px 0 20px; line-height: 1.2;">
                ${hoursRemaining.toFixed(1)} Hours Remaining
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Just a friendly heads-up that you've used ${percentUsed}% of your <strong style="color: #00CFEB;">${displayPackage}</strong> consulting hours.
              </p>

              <!-- Hours Progress Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 0 0 10px;">Package</p>
                          <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0;">${displayPackage}</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin: 0 0 10px;">Remaining</p>
                          <p style="color: #F59E0B; font-size: 24px; font-weight: 700; margin: 0;">${hoursRemaining.toFixed(1)} hrs</p>
                        </td>
                      </tr>
                    </table>
                    <!-- Progress Bar -->
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 4px; height: 8px; margin-top: 20px; overflow: hidden;">
                      <div style="background: #F59E0B; height: 100%; width: ${percentUsed}%; border-radius: 4px;"></div>
                    </div>
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin: 8px 0 0; text-align: right;">
                      ${percentUsed}% used of ${totalHours} hours
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                If you'd like to extend your engagement or add more hours, just reply to this email and we'll discuss options.
              </p>
            </td>
          </tr>
        </table>
      `;

      const clientHtml = wrapEmailContent(clientBodyContent, { theme: 'dark' });

      // Send client email
      await this.emailService.sendEmail({
        to: clientEmail,
        subject: `Your ${displayPackage} Engagement — ${hoursRemaining.toFixed(1)} Hours Remaining`,
        html: clientHtml,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      // Send admin notification
      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `Hours Running Low — ${clientName} — ${hoursRemaining.toFixed(1)} Hours Remaining`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px;">
            <h2 style="color: #F59E0B;">Hours Running Low</h2>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Package:</strong> ${displayPackage}</p>
            <p><strong>Hours Remaining:</strong> ${hoursRemaining.toFixed(1)} of ${totalHours}</p>
            <p><strong>Percent Used:</strong> ${percentUsed}%</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p>Consider reaching out to discuss extension options.</p>
          </div>
        `,
        from: 'Zander System <noreply@zanderos.com>',
      });

      this.logger.log(`Hours low emails sent for ${clientName} (${hoursRemaining} hrs remaining)`);
    } catch (error) {
      this.logger.error(`Failed to send hours low email: ${error.message}`);
    }
  }

  // ============================================
  // 7. ENGAGEMENT EXPIRING EMAIL
  // ============================================

  /**
   * Send warning that engagement is about to expire
   */
  async sendEngagementExpiringEmail(
    clientEmail: string,
    clientName: string,
    expirationDate: Date,
    hoursRemaining: number,
  ): Promise<void> {
    try {
      const expDateStr = expirationDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const daysUntil = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      // Client email
      const clientBodyContent = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">
              <span style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #EF4444; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
                Engagement Expiring Soon
              </span>

              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 20px 0 20px; line-height: 1.2;">
                ${daysUntil} Days Until Expiration
              </h1>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Hi ${clientName.split(' ')[0]},
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Your consulting engagement expires on <strong style="color: #00CFEB;">${expDateStr}</strong>.
                ${hoursRemaining > 0 ? `You still have ${hoursRemaining.toFixed(1)} hours remaining.` : ''}
              </p>

              <!-- Expiration Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #EF4444; font-size: 48px; font-weight: 700; margin: 0;">
                      ${daysUntil}
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 8px 0 0;">
                      days remaining
                    </p>
                    ${hoursRemaining > 0 ? `
                    <p style="color: #FFFFFF; font-size: 16px; margin: 15px 0 0;">
                      ${hoursRemaining.toFixed(1)} unused hours
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                If you'd like to extend your engagement, purchase a 3-month extension or upgrade to a new package.
                Reply to this email and I'll send you options.
              </p>
            </td>
          </tr>
        </table>
      `;

      const clientHtml = wrapEmailContent(clientBodyContent, { theme: 'dark' });

      // Send client email
      await this.emailService.sendEmail({
        to: clientEmail,
        subject: `Your Consulting Engagement Expires in ${daysUntil} Days`,
        html: clientHtml,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      // Send admin notification
      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `Engagement Expiring — ${clientName} — ${daysUntil} Days`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px;">
            <h2 style="color: #EF4444;">Engagement Expiring Soon</h2>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Expiration:</strong> ${expDateStr}</p>
            <p><strong>Days Remaining:</strong> ${daysUntil}</p>
            <p><strong>Hours Remaining:</strong> ${hoursRemaining.toFixed(1)}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p>Recommend reaching out to discuss extension.</p>
          </div>
        `,
        from: 'Zander System <noreply@zanderos.com>',
      });

      this.logger.log(`Engagement expiring emails sent for ${clientName}`);
    } catch (error) {
      this.logger.error(`Failed to send engagement expiring email: ${error.message}`);
    }
  }
}
