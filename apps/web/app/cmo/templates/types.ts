// Email Template Types

export type EmailBlockType =
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'columns'
  | 'social'
  | 'footer';

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BlockSettings {
  backgroundColor?: string;
  padding?: Padding;
  alignment?: 'left' | 'center' | 'right';
  [key: string]: any;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  settings: BlockSettings;
  content: Record<string, any>;
}

export interface EmailTemplateContent {
  version: string;
  settings: {
    backgroundColor: string;
    contentWidth: number;
    fontFamily: string;
    defaultTextColor: string;
  };
  blocks: EmailBlock[];
}

export interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string | null;
  body: string | null;
  type: string;
  category: string | null;
  stage: string | null;
  status: string;
  variables: any;
  createdAt: string;
  updatedAt: string;
}

export interface PrebuiltTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  thumbnail: string;
  body: EmailTemplateContent;
}

// Block-specific content types
export interface HeaderContent {
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  navLinks?: { text: string; url: string }[];
  showNav?: boolean;
}

export interface TextContent {
  html: string;
}

export interface ImageContent {
  src: string;
  alt: string;
  linkUrl?: string;
  width?: number | 'full';
}

export interface ButtonContent {
  text: string;
  url: string;
  buttonColor: string;
  textColor: string;
  borderRadius: number;
  fullWidth: boolean;
}

export interface DividerContent {
  lineColor: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineThickness: number;
  lineWidth: number;
}

export interface ColumnContent {
  width: number;
  blocks: EmailBlock[];
}

export interface ColumnsContent {
  columns: ColumnContent[];
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
}

export interface SocialContent {
  links: SocialLink[];
}

export interface FooterContent {
  companyName?: string;
  address?: string;
  unsubscribeText: string;
  unsubscribeUrl: string;
  customText?: string;
}
