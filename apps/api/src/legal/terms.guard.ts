import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';

// Decorator to skip terms check
export const SKIP_TERMS_CHECK_KEY = 'skipTermsCheck';
import { SetMetadata } from '@nestjs/common';
export const SkipTermsCheck = () => SetMetadata(SKIP_TERMS_CHECK_KEY, true);

@Injectable()
export class TermsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if this route should skip terms check
    const skipTermsCheck = this.reflector.getAllAndOverride<boolean>(SKIP_TERMS_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTermsCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (public route), allow
    if (!user || !user.sub) {
      return true;
    }

    // Get user's terms status and current terms
    const [userRecord, currentTerms] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: user.sub },
        select: {
          termsAcceptedAt: true,
          termsVersion: true,
        }
      }),
      this.prisma.termsVersion.findFirst({
        where: { effectiveDate: { lte: new Date() } },
        orderBy: { effectiveDate: 'desc' },
        select: { version: true }
      })
    ]);

    // If no terms exist yet, allow
    if (!currentTerms) {
      return true;
    }

    // Check if user has accepted the current version
    if (!userRecord?.termsAcceptedAt || !userRecord?.termsVersion) {
      throw new ForbiddenException({
        error: 'TERMS_NOT_ACCEPTED',
        message: 'You must accept the Terms of Service before continuing',
        currentVersion: currentTerms.version,
      });
    }

    // Check if user's version is outdated
    if (this.compareVersions(userRecord.termsVersion, currentTerms.version) < 0) {
      throw new ForbiddenException({
        error: 'TERMS_OUTDATED',
        message: 'Please accept the updated Terms of Service',
        userVersion: userRecord.termsVersion,
        currentVersion: currentTerms.version,
      });
    }

    return true;
  }

  /**
   * Compare two version strings
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
