import { EmailBlockType, EmailBlock, Padding, EmailTemplateContent } from './types';

// Block type configuration
export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'color' | 'select' | 'checkbox' | 'url';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface BlockTypeInfo {
  type: EmailBlockType;
  label: string;
  icon: string;
  description: string;
  category: 'structure' | 'content' | 'footer';
  defaultSettings: Record<string, any>;
  defaultContent: Record<string, any>;
  contentFields: ConfigField[];
  settingsFields: ConfigField[];
}

export const blockTypeConfig: Record<EmailBlockType, BlockTypeInfo> = {
  header: {
    type: 'header',
    label: 'Header',
    icon: '🔝',
    description: 'Logo and navigation',
    category: 'structure',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 25, right: 20, bottom: 25, left: 20 },
      alignment: 'center',
    },
    defaultContent: {
      logoUrl: '',
      logoAlt: 'Company Logo',
      logoWidth: 150,
      showNav: false,
      navLinks: [],
    },
    contentFields: [
      { key: 'logoUrl', label: 'Logo URL', type: 'url', placeholder: 'https://...' },
      { key: 'logoAlt', label: 'Logo Alt Text', type: 'text', placeholder: 'Company Logo' },
      { key: 'logoWidth', label: 'Logo Width (px)', type: 'number', defaultValue: 150 },
    ],
    settingsFields: [],
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: '📝',
    description: 'Paragraph text',
    category: 'content',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 20, right: 40, bottom: 20, left: 40 },
      alignment: 'left',
    },
    defaultContent: {
      html: '<p>Enter your text here...</p>',
    },
    contentFields: [
      { key: 'html', label: 'Content', type: 'textarea', placeholder: 'Enter text...' },
    ],
    settingsFields: [],
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    description: 'Image with optional link',
    category: 'content',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      alignment: 'center',
    },
    defaultContent: {
      src: '',
      alt: '',
      linkUrl: '',
      width: 'full',
    },
    contentFields: [
      { key: 'src', label: 'Image URL', type: 'url', placeholder: 'https://...' },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
      { key: 'linkUrl', label: 'Link URL (optional)', type: 'url', placeholder: 'https://...' },
      {
        key: 'width',
        label: 'Width',
        type: 'select',
        options: [
          { value: 'full', label: 'Full width' },
          { value: '400', label: '400px' },
          { value: '300', label: '300px' },
          { value: '200', label: '200px' },
        ],
      },
    ],
    settingsFields: [],
  },
  button: {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    description: 'Call-to-action button',
    category: 'content',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 20, right: 40, bottom: 20, left: 40 },
      alignment: 'center',
    },
    defaultContent: {
      text: 'Click Here',
      url: '#',
      buttonColor: '#F57C00',
      textColor: '#ffffff',
      borderRadius: 6,
      fullWidth: false,
    },
    contentFields: [
      { key: 'text', label: 'Button Text', type: 'text', placeholder: 'Click Here' },
      { key: 'url', label: 'Link URL', type: 'url', placeholder: 'https://...' },
      { key: 'buttonColor', label: 'Button Color', type: 'color', defaultValue: '#F57C00' },
      { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'borderRadius', label: 'Border Radius', type: 'number', defaultValue: 6 },
      { key: 'fullWidth', label: 'Full Width', type: 'checkbox', defaultValue: false },
    ],
    settingsFields: [],
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: '➖',
    description: 'Horizontal line separator',
    category: 'content',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 15, right: 40, bottom: 15, left: 40 },
    },
    defaultContent: {
      lineColor: '#dddddd',
      lineStyle: 'solid',
      lineThickness: 1,
      lineWidth: 100,
    },
    contentFields: [
      { key: 'lineColor', label: 'Line Color', type: 'color', defaultValue: '#dddddd' },
      {
        key: 'lineStyle',
        label: 'Line Style',
        type: 'select',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ],
      },
      { key: 'lineThickness', label: 'Thickness (px)', type: 'number', defaultValue: 1 },
      { key: 'lineWidth', label: 'Width (%)', type: 'number', defaultValue: 100 },
    ],
    settingsFields: [],
  },
  columns: {
    type: 'columns',
    label: 'Columns',
    icon: '▥',
    description: '2 or 3 column layout',
    category: 'structure',
    defaultSettings: {
      backgroundColor: '#ffffff',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      columnCount: 2,
      columnGap: 20,
    },
    defaultContent: {
      columns: [
        { width: 50, blocks: [] },
        { width: 50, blocks: [] },
      ],
    },
    contentFields: [],
    settingsFields: [
      {
        key: 'columnCount',
        label: 'Columns',
        type: 'select',
        options: [
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
        ],
      },
      { key: 'columnGap', label: 'Column Gap (px)', type: 'number', defaultValue: 20 },
    ],
  },
  social: {
    type: 'social',
    label: 'Social',
    icon: '🔗',
    description: 'Social media icons',
    category: 'footer',
    defaultSettings: {
      backgroundColor: '#f8f8f8',
      padding: { top: 25, right: 40, bottom: 25, left: 40 },
      alignment: 'center',
      iconSize: 'medium',
    },
    defaultContent: {
      links: [
        { platform: 'facebook', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' },
      ],
    },
    contentFields: [],
    settingsFields: [
      {
        key: 'iconSize',
        label: 'Icon Size',
        type: 'select',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
    ],
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    icon: '📋',
    description: 'Unsubscribe and company info',
    category: 'footer',
    defaultSettings: {
      backgroundColor: '#f8f8f8',
      padding: { top: 25, right: 40, bottom: 25, left: 40 },
      alignment: 'center',
      textColor: '#666666',
      fontSize: 12,
    },
    defaultContent: {
      companyName: '{{company_name}}',
      address: '{{company_address}}',
      unsubscribeText: 'Unsubscribe',
      unsubscribeUrl: '{{unsubscribe_url}}',
      customText: '',
    },
    contentFields: [
      { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Company Name' },
      { key: 'address', label: 'Address', type: 'text', placeholder: 'Company Address' },
      { key: 'unsubscribeText', label: 'Unsubscribe Text', type: 'text', defaultValue: 'Unsubscribe' },
      { key: 'customText', label: 'Custom Text', type: 'textarea', placeholder: 'Additional text...' },
    ],
    settingsFields: [
      { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#666666' },
      { key: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 12 },
    ],
  },
};

// Helper functions
export function getBlockTypeInfo(type: EmailBlockType): BlockTypeInfo {
  return blockTypeConfig[type];
}

export function getBlocksByCategory(): Record<string, BlockTypeInfo[]> {
  const categories: Record<string, BlockTypeInfo[]> = {
    structure: [],
    content: [],
    footer: [],
  };

  Object.values(blockTypeConfig).forEach((info) => {
    categories[info.category].push(info);
  });

  return categories;
}

export function createDefaultBlock(type: EmailBlockType): EmailBlock {
  const info = blockTypeConfig[type];
  return {
    id: generateBlockId(),
    type,
    settings: { ...info.defaultSettings },
    content: JSON.parse(JSON.stringify(info.defaultContent)),
  };
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function parseTemplateBody(body: string | null): EmailTemplateContent {
  if (!body) {
    return {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [],
    };
  }

  try {
    return JSON.parse(body);
  } catch {
    return {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [],
    };
  }
}

export function moveBlock(blocks: EmailBlock[], fromIndex: number, toIndex: number): EmailBlock[] {
  const result = [...blocks];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function insertBlockAt(blocks: EmailBlock[], block: EmailBlock, index: number): EmailBlock[] {
  const result = [...blocks];
  result.splice(index, 0, block);
  return result;
}

export function removeBlockAt(blocks: EmailBlock[], index: number): EmailBlock[] {
  const result = [...blocks];
  result.splice(index, 1);
  return result;
}

export function updateBlockAt(blocks: EmailBlock[], index: number, updates: Partial<EmailBlock>): EmailBlock[] {
  const result = [...blocks];
  result[index] = { ...result[index], ...updates };
  return result;
}

// Default padding for common use
export const DEFAULT_PADDING: Padding = { top: 20, right: 20, bottom: 20, left: 20 };
