/**
 * Universal Zander Email Signature
 *
 * This signature is appended to ALL outgoing emails from:
 * - AI Executives (Pam, Jordan, Don)
 * - Transactional emails (welcome, confirmations)
 * - Consulting lifecycle emails
 *
 * All communications are L3 DRAFT until Jonathan reviews.
 */

// Logo hosted at public URL so email clients can fetch it
const ZANDER_LOGO_URL = 'https://app.zanderos.com/brand/zander-logo.svg';

// Brand colors
const COLORS = {
  cyan: '#00CFEB',
  navy: '#0C2340',
  dark: '#080A0F',
  lightText: 'rgba(255, 255, 255, 0.7)',
  mutedText: 'rgba(255, 255, 255, 0.5)',
};

/**
 * Get the universal Zander email signature HTML
 * Designed for both light and dark email client backgrounds
 */
export function getEmailSignature(): string {
  return `
    <!-- Zander Email Signature -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; border-top: 1px solid rgba(0, 207, 235, 0.3); padding-top: 25px;">
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <!-- Logo Column -->
              <td style="padding-right: 20px; vertical-align: top;">
                <img src="${ZANDER_LOGO_URL}" alt="Zander" style="height: 50px; width: auto;" />
              </td>
              <!-- Divider -->
              <td style="border-left: 2px solid ${COLORS.cyan}; padding-left: 20px; vertical-align: top;">
                <!-- Name and Title -->
                <p style="color: #333333; font-size: 16px; font-weight: 700; margin: 0 0 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Jonathan White
                </p>
                <p style="color: #666666; font-size: 14px; margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Founder & CEO
                </p>
                <!-- Tagline -->
                <p style="color: ${COLORS.cyan}; font-size: 13px; font-style: italic; margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  "Operating Simply"
                </p>
                <!-- Contact Info -->
                <p style="color: #888888; font-size: 13px; margin: 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <a href="mailto:jonathan@zanderos.com" style="color: #333333; text-decoration: none;">jonathan@zanderos.com</a><br>
                  <a href="https://zanderos.com" style="color: ${COLORS.cyan}; text-decoration: none;">zanderos.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 15px;">
          <p style="color: #999999; font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Zander Systems LLC
          </p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Get email signature for dark-themed emails
 * Used in consulting and transactional emails with dark backgrounds
 */
export function getEmailSignatureDark(): string {
  return `
    <!-- Zander Email Signature (Dark Theme) -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; border-top: 1px solid rgba(0, 207, 235, 0.3); padding-top: 25px;">
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <!-- Logo Column -->
              <td style="padding-right: 20px; vertical-align: top;">
                <img src="${ZANDER_LOGO_URL}" alt="Zander" style="height: 50px; width: auto;" />
              </td>
              <!-- Divider -->
              <td style="border-left: 2px solid ${COLORS.cyan}; padding-left: 20px; vertical-align: top;">
                <!-- Name and Title -->
                <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Jonathan White
                </p>
                <p style="color: ${COLORS.lightText}; font-size: 14px; margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Founder & CEO
                </p>
                <!-- Tagline -->
                <p style="color: ${COLORS.cyan}; font-size: 13px; font-style: italic; margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  "Operating Simply"
                </p>
                <!-- Contact Info -->
                <p style="color: ${COLORS.mutedText}; font-size: 13px; margin: 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <a href="mailto:jonathan@zanderos.com" style="color: #FFFFFF; text-decoration: none;">jonathan@zanderos.com</a><br>
                  <a href="https://zanderos.com" style="color: ${COLORS.cyan}; text-decoration: none;">zanderos.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 15px;">
          <p style="color: rgba(255, 255, 255, 0.35); font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Zander Systems LLC
          </p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Wrap content in a standard Zander email template
 * Dark theme with logo header and signature footer
 */
export function wrapEmailContent(bodyContent: string, options: { theme?: 'dark' | 'light' } = {}): string {
  const theme = options.theme || 'dark';
  const signature = theme === 'dark' ? getEmailSignatureDark() : getEmailSignature();
  const bgColor = theme === 'dark' ? '#080A0F' : '#FFFFFF';
  const bgGradient = theme === 'dark' ? 'linear-gradient(180deg, #080A0F 0%, #0E1117 100%)' : '#FFFFFF';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${bgColor};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="padding: 40px 30px; background: ${bgGradient};">
            <!-- Header with Logo -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding-bottom: 30px; border-bottom: 1px solid rgba(0, 207, 235, 0.2);">
                  <img src="${ZANDER_LOGO_URL}" alt="Zander" style="height: 36px; width: auto;">
                </td>
              </tr>
            </table>

            <!-- Email Body Content -->
            ${bodyContent}

            <!-- Email Signature -->
            ${signature}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Standard email footer for below signature
 * Used at the very bottom of emails
 */
export function getEmailFooter(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
      <tr>
        <td style="text-align: center;">
          <p style="color: rgba(255, 255, 255, 0.35); font-size: 11px; margin: 0;">
            Zander Systems LLC &bull; <a href="https://zanderos.com" style="color: rgba(255, 255, 255, 0.35); text-decoration: none;">zanderos.com</a>
          </p>
        </td>
      </tr>
    </table>
  `;
}
