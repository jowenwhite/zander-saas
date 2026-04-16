import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================
// DESIGN TOOL ADAPTER INTERFACES
// Phase 4: Marketing Execution Architecture
// ============================================

export interface DesignTemplate {
  id: string;
  name: string;
  thumbnailUrl: string;
  dimensions: { width: number; height: number };
  category: string;
}

export interface DesignExport {
  fileUrl: string;
  format: string;
  dimensions: { width: number; height: number };
}

export interface DesignAdapter {
  createDesign(tenantId: string, options: {
    templateId?: string;
    name: string;
    type: string;
  }): Promise<{ success: boolean; designId?: string; editUrl?: string; error?: string }>;

  listTemplates(category?: string): Promise<{ success: boolean; templates?: DesignTemplate[]; error?: string }>;

  exportAsset(designId: string, format: string): Promise<{ success: boolean; export?: DesignExport; error?: string }>;

  importToAssetLibrary(tenantId: string, externalAssetId: string): Promise<{ success: boolean; assetId?: string; error?: string }>;
}

// ============================================
// CANVA ADAPTER (leverages existing MCP connection)
// ============================================

class CanvaAdapter implements DesignAdapter {
  async createDesign(tenantId: string, options: {
    templateId?: string;
    name: string;
    type: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Canva Connect API integration
    // Requires: Canva Connect API app in developer portal
    // Uses MCP connection when available
    return {
      success: false,
      error: 'Canva integration not yet configured. Set up Canva Connect API via canva.com/developers.'
    };
  }

  async listTemplates(category?: string): Promise<{ success: boolean; templates?: DesignTemplate[]; error?: string }> {
    return {
      success: false,
      error: 'Canva integration not yet configured.'
    };
  }

  async exportAsset(designId: string, format: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Canva integration not yet configured.'
    };
  }

  async importToAssetLibrary(tenantId: string, externalAssetId: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Canva integration not yet configured.'
    };
  }
}

// ============================================
// ADOBE CREATIVE CLOUD ADAPTER
// ============================================

class AdobeAdapter implements DesignAdapter {
  async createDesign(tenantId: string, options: {
    templateId?: string;
    name: string;
    type: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Adobe Creative Cloud API integration
    // Requires: Adobe Developer Console app with Creative Cloud APIs enabled
    // Express API for quick designs, full CC API for advanced
    return {
      success: false,
      error: 'Adobe Creative Cloud integration not yet configured. Set up via Adobe Developer Console.'
    };
  }

  async listTemplates(category?: string): Promise<{ success: boolean; templates?: DesignTemplate[]; error?: string }> {
    return {
      success: false,
      error: 'Adobe Creative Cloud integration not yet configured.'
    };
  }

  async exportAsset(designId: string, format: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Adobe Creative Cloud integration not yet configured.'
    };
  }

  async importToAssetLibrary(tenantId: string, externalAssetId: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Adobe Creative Cloud integration not yet configured.'
    };
  }
}

// ============================================
// MAIN DESIGN SERVICE
// ============================================

@Injectable()
export class DesignService {
  private readonly logger = new Logger(DesignService.name);
  private canvaAdapter: CanvaAdapter;
  private adobeAdapter: AdobeAdapter;

  constructor(private prisma: PrismaService) {
    this.canvaAdapter = new CanvaAdapter();
    this.adobeAdapter = new AdobeAdapter();
  }

  private getAdapter(source: string): DesignAdapter {
    switch (source.toLowerCase()) {
      case 'canva':
        return this.canvaAdapter;
      case 'adobe':
        return this.adobeAdapter;
      default:
        throw new Error(`Unsupported design source: ${source}`);
    }
  }

  // ============================================
  // ASSET MANAGEMENT
  // ============================================

  async createDesignAsset(
    tenantId: string,
    options: {
      name: string;
      type: string;
      source: string;
      templateId?: string;
      campaignId?: string;
      tags?: string[];
    }
  ) {
    const { name, type, source, templateId, campaignId, tags } = options;

    // Try to create in external tool
    const adapter = this.getAdapter(source);
    const result = await adapter.createDesign(tenantId, { templateId, name, type });

    // Create database record regardless of external integration status
    const asset = await this.prisma.designAsset.create({
      data: {
        tenantId,
        name,
        type,
        source,
        sourceId: result.designId || null,
        campaignId,
        tags: tags || [],
      },
    });

    return {
      success: true,
      asset,
      externalStatus: result.success ? 'created' : 'pending_integration',
      editUrl: result.editUrl,
      note: result.error || 'Asset record created successfully',
    };
  }

  async getBrandAssets(tenantId: string, options: { type?: string; source?: string } = {}) {
    const { type, source } = options;

    const assets = await this.prisma.designAsset.findMany({
      where: {
        tenantId,
        ...(type ? { type } : {}),
        ...(source ? { source } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, assets };
  }

  async getTemplates(source: string, category?: string) {
    const adapter = this.getAdapter(source);
    return adapter.listTemplates(category);
  }

  async exportAsset(assetId: string, format: string) {
    const asset = await this.prisma.designAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }

    if (!asset.sourceId) {
      return { success: false, error: 'Asset has no external design ID - cannot export' };
    }

    const adapter = this.getAdapter(asset.source);
    const result = await adapter.exportAsset(asset.sourceId, format);

    if (result.success && result.export) {
      // Update asset record with exported file URL
      await this.prisma.designAsset.update({
        where: { id: assetId },
        data: {
          fileUrl: result.export.fileUrl,
          format: result.export.format,
          dimensions: result.export.dimensions,
        },
      });
    }

    return result;
  }

  // ============================================
  // SOCIAL GRAPHIC GENERATION
  // For Don to create graphics for social posts
  // ============================================

  async generateSocialGraphic(
    tenantId: string,
    options: {
      platform: string;
      content: string;
      style?: string;
      source?: string;
    }
  ) {
    const { platform, content, style, source } = options;

    // Platform-specific dimensions
    const dimensions: Record<string, { width: number; height: number }> = {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      linkedin: { width: 1200, height: 627 },
      tiktok: { width: 1080, height: 1920 },
      youtube: { width: 1280, height: 720 },
      twitter: { width: 1200, height: 675 },
    };

    const dim = dimensions[platform] || { width: 1200, height: 630 };

    // Create asset record
    const asset = await this.prisma.designAsset.create({
      data: {
        tenantId,
        name: `${platform} graphic - ${new Date().toISOString().split('T')[0]}`,
        type: 'graphic',
        source: source || 'ai_generated',
        dimensions: dim,
        tags: [platform, 'social', 'auto-generated'],
      },
    });

    return {
      success: true,
      asset,
      dimensions: dim,
      note: 'Graphic asset created. AI image generation or Canva integration required to generate actual visual.',
      nextSteps: [
        'Connect Canva or Adobe for template-based generation',
        'Or use AI image generation API for custom graphics',
        'Asset record created - attach generated image when available',
      ],
    };
  }
}
