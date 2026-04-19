/**
 * Base Email Layout
 *
 * Provides a consistent email wrapper that works across all email clients
 * including Gmail and Outlook which strip CSS max-width properties.
 *
 * Uses HTML table attributes (width="600") instead of CSS for reliable rendering.
 */

const ZANDER_LOGO_URL = 'https://app.zanderos.com/brand/zander-logo.svg';

// Brand colors - shared across all email templates
export const EMAIL_COLORS = {
  background: '#0D1117',
  backgroundAlt: '#161B22',
  cyan: '#00D4FF',
  red: '#BF0A30',
  white: '#FFFFFF',
  lightGray: 'rgba(255, 255, 255, 0.85)',
  mutedGray: 'rgba(255, 255, 255, 0.6)',
  borderColor: 'rgba(0, 212, 255, 0.2)',
};

export interface BaseLayoutOptions {
  showSignature?: boolean;
  showHeader?: boolean;
  preheaderText?: string;
}

/**
 * Wrap email body content in the standard Zander email layout.
 *
 * Uses table-based layout with HTML width attributes for maximum
 * email client compatibility (Gmail, Outlook, Apple Mail, etc.)
 *
 * @param bodyHtml - The inner content HTML
 * @param options - Layout options
 * @returns Complete HTML email document
 */
export function wrapInBaseLayout(
  bodyHtml: string,
  options: BaseLayoutOptions = {}
): string {
  const { showSignature = true, showHeader = true, preheaderText = '' } = options;

  const preheader = preheaderText
    ? `<!--[if !mso]><!--><div style="display:none;font-size:1px;color:#0D1117;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheaderText}</div><!--<![endif]-->`
    : '';

  const header = showHeader
    ? `
        <!-- Header with Logo -->
        <tr>
          <td style="padding: 40px 40px 30px 40px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding-bottom: 25px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">
                  <img src="${ZANDER_LOGO_URL}" alt="Zander" width="180" height="80" style="display: block; height: 80px; width: auto; border: 0;" />
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: ${EMAIL_COLORS.white}; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, Helvetica, sans-serif;">Operating Simply</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : '';

  const signature = showSignature
    ? `
        <!-- Signature -->
        <tr>
          <td style="padding: 0 40px 40px 40px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid ${EMAIL_COLORS.borderColor}; padding-top: 25px;">
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <!-- Logo Column -->
                      <td style="padding-right: 20px; vertical-align: top;">
                        <img src="${ZANDER_LOGO_URL}" alt="Zander" width="100" height="56" style="display: block; height: 56px; width: auto; border: 0;" />
                      </td>
                      <!-- Divider -->
                      <td style="border-left: 2px solid ${EMAIL_COLORS.cyan}; padding-left: 20px; vertical-align: top;">
                        <!-- Name and Title -->
                        <p style="color: ${EMAIL_COLORS.white}; font-size: 16px; font-weight: 700; margin: 0 0 2px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                          Jonathan White
                        </p>
                        <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                          Founder
                        </p>
                        <!-- Contact Info -->
                        <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 13px; margin: 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                          Zander Systems LLC<br />
                          <a href="https://zanderos.com" style="color: ${EMAIL_COLORS.cyan}; text-decoration: none;">zanderos.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Zander</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0D1117 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader}

  <!-- Outer wrapper table for centering -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${EMAIL_COLORS.background};" class="email-bg">
    <tr>
      <td align="center" style="padding: 20px 10px;">

        <!--[if mso]>
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
        <td>
        <![endif]-->

        <!-- Main content table - fixed 600px width -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="width: 600px; max-width: 600px; background-color: ${EMAIL_COLORS.background};">

          ${header}

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          ${signature}

        </table>

        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Create a section header with cyan left border
 */
export function createSectionHeader(title: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 35px 0 20px 0;">
      <tr>
        <td style="border-left: 3px solid ${EMAIL_COLORS.cyan}; padding-left: 20px;">
          <p style="color: ${EMAIL_COLORS.cyan}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
            ${title}
          </p>
        </td>
      </tr>
    </table>`;
}

/**
 * Create a paragraph with standard styling
 */
export function createParagraph(text: string, options?: { bold?: boolean; large?: boolean; italic?: boolean }): string {
  const { bold = false, large = false, italic = false } = options || {};
  const color = bold ? EMAIL_COLORS.white : EMAIL_COLORS.lightGray;
  const fontSize = large ? '18px' : '16px';
  const fontWeight = bold ? '600' : 'normal';
  const fontStyle = italic ? 'italic' : 'normal';

  return `<p style="color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle}; line-height: 1.7; margin: 0 0 20px 0;">${text}</p>`;
}

/**
 * Create a large headline
 */
export function createHeadline(text: string): string {
  return `<p style="color: ${EMAIL_COLORS.white}; font-size: 42px; font-weight: 700; margin: 30px 0; letter-spacing: -1px;">${text}</p>`;
}
