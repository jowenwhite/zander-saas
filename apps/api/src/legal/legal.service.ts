import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the current (latest) terms version
   */
  async getCurrentTerms(): Promise<{
    version: string;
    content: string;
    effectiveDate: Date;
  } | null> {
    const terms = await this.prisma.termsVersion.findFirst({
      where: {
        effectiveDate: { lte: new Date() }
      },
      orderBy: { effectiveDate: 'desc' },
      select: {
        version: true,
        content: true,
        effectiveDate: true,
      }
    });

    return terms;
  }

  /**
   * Get terms by specific version
   */
  async getTermsByVersion(version: string): Promise<{
    version: string;
    content: string;
    effectiveDate: Date;
  }> {
    const terms = await this.prisma.termsVersion.findUnique({
      where: { version },
      select: {
        version: true,
        content: true,
        effectiveDate: true,
      }
    });

    if (!terms) {
      throw new NotFoundException(`Terms version ${version} not found`);
    }

    return terms;
  }

  /**
   * Check if user needs to accept terms (either never accepted or outdated version)
   */
  async needsTermsAcceptance(userId: string): Promise<{
    needsAcceptance: boolean;
    currentVersion: string | null;
    userVersion: string | null;
    userAcceptedAt: Date | null;
  }> {
    const [user, currentTerms] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          termsAcceptedAt: true,
          termsVersion: true,
        }
      }),
      this.getCurrentTerms()
    ]);

    if (!currentTerms) {
      // No terms defined yet, no acceptance needed
      return {
        needsAcceptance: false,
        currentVersion: null,
        userVersion: user?.termsVersion || null,
        userAcceptedAt: user?.termsAcceptedAt || null,
      };
    }

    const needsAcceptance = !user?.termsAcceptedAt ||
      !user?.termsVersion ||
      this.compareVersions(user.termsVersion, currentTerms.version) < 0;

    return {
      needsAcceptance,
      currentVersion: currentTerms.version,
      userVersion: user?.termsVersion || null,
      userAcceptedAt: user?.termsAcceptedAt || null,
    };
  }

  /**
   * Record user's acceptance of terms
   */
  async acceptTerms(userId: string, version: string): Promise<{
    success: boolean;
    acceptedAt: Date;
    version: string;
  }> {
    // Verify the version exists
    const terms = await this.prisma.termsVersion.findUnique({
      where: { version }
    });

    if (!terms) {
      throw new NotFoundException(`Terms version ${version} not found`);
    }

    const acceptedAt = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        termsAcceptedAt: acceptedAt,
        termsVersion: version,
      }
    });

    return {
      success: true,
      acceptedAt,
      version,
    };
  }

  /**
   * Get user's current terms acceptance status
   */
  async getUserTermsStatus(userId: string): Promise<{
    acceptedAt: Date | null;
    acceptedVersion: string | null;
    currentVersion: string | null;
    isUpToDate: boolean;
  }> {
    const [user, currentTerms] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          termsAcceptedAt: true,
          termsVersion: true,
        }
      }),
      this.getCurrentTerms()
    ]);

    const isUpToDate = !currentTerms || (
      user?.termsVersion !== null &&
      this.compareVersions(user.termsVersion!, currentTerms.version) >= 0
    );

    return {
      acceptedAt: user?.termsAcceptedAt || null,
      acceptedVersion: user?.termsVersion || null,
      currentVersion: currentTerms?.version || null,
      isUpToDate,
    };
  }

  /**
   * Create a new terms version (admin only)
   */
  async createTermsVersion(data: {
    version: string;
    content: string;
    effectiveDate: Date;
  }): Promise<{ id: string; version: string; effectiveDate: Date }> {
    const terms = await this.prisma.termsVersion.create({
      data: {
        version: data.version,
        content: data.content,
        effectiveDate: data.effectiveDate,
      },
      select: {
        id: true,
        version: true,
        effectiveDate: true,
      }
    });

    return terms;
  }

  /**
   * Compare two version strings (e.g., "1.0" vs "1.1")
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  }
}
