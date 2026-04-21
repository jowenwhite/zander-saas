/**
 * Email HTML Generator
 * Converts block-based template JSON to responsive email HTML
 */

export interface EmailTemplateContent {
  version: string;
  settings: {
    backgroundColor?: string;
    contentWidth?: number;
    fontFamily?: string;
    defaultTextColor?: string;
  };
  blocks: EmailBlock[];
}

export interface EmailBlock {
  id: string;
  type: string;
  settings: {
    backgroundColor?: string;
    padding?: { top: number; right: number; bottom: number; left: number };
    alignment?: 'left' | 'center' | 'right';
    [key: string]: any;
  };
  content: Record<string, any>;
}

export function generateEmailHtml(template: EmailTemplateContent, subject: string): string {
  // Defensive: ensure template is a valid object
  if (!template || typeof template !== 'object') {
    console.error('[html-generator] Invalid template object:', typeof template, template);
    template = { version: '1.0', settings: {}, blocks: [] };
  }

  const settings = {
    backgroundColor: '#f4f4f4',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
    // CRITICAL: Email text MUST be dark (#333333) on white background
    // Do NOT allow template to override with light/dark-theme colors
    defaultTextColor: '#333333',
    ...(template.settings || {}),
  };
  // Force dark text color for email - override any light colors from template
  settings.defaultTextColor = '#333333';

  // CRITICAL: Use Array.isArray to handle cases where blocks is truthy but not an array
  if (!Array.isArray(template.blocks)) {
    console.error('[html-generator] template.blocks is not an array:', typeof template.blocks, template.blocks);
  }
  const blocks = Array.isArray(template.blocks) ? template.blocks : [];
  const blocksHtml = blocks.map((block) => generateBlockHtml(block, settings)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    /* Mobile styles */
    @media only screen and (max-width: 480px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content {
        padding: 10px !important;
      }
      .column {
        display: block !important;
        width: 100% !important;
      }
      .button {
        width: 100% !important;
        display: block !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${settings.backgroundColor}; font-family: ${settings.fontFamily};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${settings.backgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="container" width="${settings.contentWidth}" cellspacing="0" cellpadding="0" border="0" style="max-width: ${settings.contentWidth}px; background-color: #ffffff;">
${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateBlockHtml(block: EmailBlock, settings: any): string {
  const padding = block.settings.padding || { top: 20, right: 20, bottom: 20, left: 20 };
  const bgColor = block.settings.backgroundColor || '#ffffff';
  const align = block.settings.alignment || 'left';

  switch (block.type) {
    case 'header':
      return generateHeaderBlock(block, padding, bgColor, align);
    case 'text':
      return generateTextBlock(block, padding, bgColor, align, settings);
    case 'image':
      return generateImageBlock(block, padding, bgColor, align);
    case 'button':
      return generateButtonBlock(block, padding, bgColor, align);
    case 'divider':
      return generateDividerBlock(block, padding, bgColor);
    case 'columns':
      return generateColumnsBlock(block, padding, bgColor, settings);
    case 'social':
      return generateSocialBlock(block, padding, bgColor, align);
    case 'footer':
      return generateFooterBlock(block, padding, bgColor, align);
    default:
      return '';
  }
}

function generateHeaderBlock(block: EmailBlock, padding: any, bgColor: string, align: string): string {
  const content = block.content;
  const logoHtml = content.logoUrl
    ? `<img src="${escapeHtml(content.logoUrl)}" alt="${escapeHtml(content.logoAlt || 'Logo')}" width="${content.logoWidth || 150}" style="display: block; margin: 0 auto;">`
    : '';

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align};">
              ${logoHtml}
            </td>
          </tr>`;
}

function generateTextBlock(block: EmailBlock, padding: any, bgColor: string, align: string, settings: any): string {
  // Sanitize HTML content to replace light text colors with dark ones for email
  const html = sanitizeTextColorsForEmail(block.content.html || '');

  return `          <tr>
            <td class="content" style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align}; color: ${settings.defaultTextColor}; font-size: 16px; line-height: 1.6;">
              ${html}
            </td>
          </tr>`;
}

/**
 * Sanitize text colors in HTML content for email output.
 * Replaces light/dark-theme colors with standard dark text color.
 */
function sanitizeTextColorsForEmail(html: string): string {
  if (!html) return '';

  // List of light colors that should be replaced with dark text
  const lightColors = [
    '#F0F0F5', '#f0f0f5',
    '#E0E0E5', '#e0e0e5',
    '#D0D0D5', '#d0d0d5',
    '#C0C0C5', '#c0c0c5',
    '#B0B0B5', '#b0b0b5',
    '#A0A0A5', '#a0a0a5',
    '#ffffff', '#FFFFFF',
    '#fafafa', '#FAFAFA',
    '#f5f5f5', '#F5F5F5',
    '#eeeeee', '#EEEEEE',
    '#e0e0e0', '#E0E0E0',
    'white', 'White', 'WHITE',
    'rgb(240, 240, 245)', 'rgb(224, 224, 229)',
    'rgba(240, 240, 245', 'rgba(224, 224, 229',
  ];

  let sanitized = html;

  // Replace light colors with dark text color
  for (const lightColor of lightColors) {
    // Replace in style="color: X" patterns
    const colorRegex = new RegExp(`color:\\s*${lightColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
    sanitized = sanitized.replace(colorRegex, 'color: #333333');
  }

  return sanitized;
}

function generateImageBlock(block: EmailBlock, padding: any, bgColor: string, align: string): string {
  const content = block.content;
  const width = content.width === 'full' ? '100%' : `${content.width || 'auto'}`;
  const imgHtml = `<img src="${escapeHtml(content.src || '')}" alt="${escapeHtml(content.alt || '')}" width="${width}" style="display: block; max-width: 100%; height: auto;">`;
  const finalHtml = content.linkUrl ? `<a href="${escapeHtml(content.linkUrl)}">${imgHtml}</a>` : imgHtml;

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align};">
              ${finalHtml}
            </td>
          </tr>`;
}

function generateButtonBlock(block: EmailBlock, padding: any, bgColor: string, align: string): string {
  const content = block.content;
  const buttonColor = content.buttonColor || '#F57C00';
  const textColor = content.textColor || '#ffffff';
  const borderRadius = content.borderRadius || 4;
  const fullWidth = content.fullWidth ? 'width: 100%;' : '';

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="${content.fullWidth ? 'width: 100%;' : ''}">
                <tr>
                  <td style="border-radius: ${borderRadius}px; background-color: ${buttonColor};">
                    <a href="${escapeHtml(content.url || '#')}" class="button" style="display: inline-block; padding: 14px 28px; color: ${textColor}; text-decoration: none; font-weight: bold; font-size: 16px; ${fullWidth}">
                      ${escapeHtml(content.text || 'Click Here')}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function generateDividerBlock(block: EmailBlock, padding: any, bgColor: string): string {
  const content = block.content;
  const lineColor = content.lineColor || '#dddddd';
  const lineStyle = content.lineStyle || 'solid';
  const lineThickness = content.lineThickness || 1;
  const lineWidth = content.lineWidth || 100;

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor};">
              <table role="presentation" width="${lineWidth}%" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="border-top: ${lineThickness}px ${lineStyle} ${lineColor};"></td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function generateColumnsBlock(block: EmailBlock, padding: any, bgColor: string, settings: any): string {
  const content = block.content;
  const columns = content.columns || [];
  const columnGap = block.settings.columnGap || 10;

  if (columns.length === 0) return '';

  const columnWidth = Math.floor(100 / columns.length);
  const columnsHtml = columns
    .map(
      (col: any, index: number) => `
                <td class="column" width="${col.width || columnWidth}%" valign="top" style="padding: 0 ${index < columns.length - 1 ? columnGap / 2 : 0}px 0 ${index > 0 ? columnGap / 2 : 0}px;">
                  ${col.blocks?.map((b: EmailBlock) => generateBlockHtml(b, settings)).join('') || ''}
                </td>`,
    )
    .join('');

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
${columnsHtml}
                </tr>
              </table>
            </td>
          </tr>`;
}

function generateSocialBlock(block: EmailBlock, padding: any, bgColor: string, align: string): string {
  const content = block.content;
  const links = content.links || [];
  const iconSize = block.settings.iconSize === 'large' ? 40 : block.settings.iconSize === 'small' ? 24 : 32;

  const socialIcons: Record<string, string> = {
    facebook: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
    twitter: 'https://cdn-icons-png.flaticon.com/512/124/124021.png',
    instagram: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
    linkedin: 'https://cdn-icons-png.flaticon.com/512/124/124011.png',
    youtube: 'https://cdn-icons-png.flaticon.com/512/174/174883.png',
    tiktok: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
  };

  const linksHtml = links
    .map(
      (link: any) => `
                    <td style="padding: 0 8px;">
                      <a href="${escapeHtml(link.url || '#')}">
                        <img src="${socialIcons[link.platform] || ''}" alt="${link.platform}" width="${iconSize}" height="${iconSize}" style="display: block;">
                      </a>
                    </td>`,
    )
    .join('');

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${align}">
                <tr>
${linksHtml}
                </tr>
              </table>
            </td>
          </tr>`;
}

function generateFooterBlock(block: EmailBlock, padding: any, bgColor: string, align: string): string {
  const content = block.content;
  // Force dark footer text for email - #666666 is standard footer gray
  const textColor = '#666666';
  const fontSize = block.settings.fontSize || 12;

  const parts: string[] = [];
  if (content.companyName) parts.push(escapeHtml(content.companyName));
  if (content.address) parts.push(escapeHtml(content.address));
  if (content.customText) parts.push(escapeHtml(content.customText));

  const unsubscribeUrl = content.unsubscribeUrl || '{{unsubscribe_url}}';
  const unsubscribeText = content.unsubscribeText || 'Unsubscribe';

  return `          <tr>
            <td style="padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px; background-color: ${bgColor}; text-align: ${align}; color: ${textColor}; font-size: ${fontSize}px; line-height: 1.5;">
              ${parts.join('<br>')}
              ${parts.length > 0 ? '<br><br>' : ''}
              <a href="${escapeHtml(unsubscribeUrl)}" style="color: ${textColor}; text-decoration: underline;">${escapeHtml(unsubscribeText)}</a>
            </td>
          </tr>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
