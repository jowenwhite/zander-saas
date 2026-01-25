export type AssetType = 'image' | 'document' | 'video' | 'other';

export interface Asset {
  id: string;
  tenantId: string;
  name: string;
  assetType: AssetType;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  folder?: string;
  tags: string[];
  metadata?: {
    s3Key?: string;
    s3Bucket?: string;
    [key: string]: any;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorageInfo {
  used: number;
  limit: number;
  usedFormatted: string;
  limitFormatted: string;
  percentUsed: number;
  canUpload: boolean;
}

export interface FolderInfo {
  name: string;
  count: number;
}

export interface FoldersResponse {
  folders: FolderInfo[];
  total: number;
}

export const FOLDER_OPTIONS = ['Logos', 'Images', 'Documents', 'Templates'] as const;
export type FolderType = typeof FOLDER_OPTIONS[number];
