import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllByTenant(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return users;
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async invite(tenantId: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    // Check if user already exists in this tenant
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email, tenantId },
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists in your organization');
    }

    // Create user with temporary password (they'll reset it)
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: data.role || 'member',
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // TODO: Send invitation email with tempPassword
    // For now, return the user (in production, email would be sent)

    return { user, tempPassword };
  }

  async update(id: string, tenantId: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
  }) {
    // Verify user belongs to tenant
    const existing = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string, tenantId: string, requestingUserId: string) {
    // Prevent self-deletion
    if (id === requestingUserId) {
      throw new BadRequestException('You cannot remove yourself');
    }

    // Verify user belongs to tenant
    const existing = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true, message: 'User removed successfully' };
  }

  // ==================== ONBOARDING METHODS ====================

  async getOnboardingStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        onboardingCompleted: true,
        onboardingStep: true,
        onboardingFocusArea: true,
        onboardingChecklist: true,
        firstLoginAt: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateOnboardingStep(userId: string, step: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: step },
      select: {
        id: true,
        onboardingStep: true,
        onboardingCompleted: true,
      },
    });
  }

  async setOnboardingFocusArea(userId: string, focusArea: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingFocusArea: focusArea },
      select: {
        id: true,
        onboardingFocusArea: true,
      },
    });
  }

  async updateOnboardingChecklist(userId: string, checklist: Record<string, boolean>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingChecklist: checklist },
      select: {
        id: true,
        onboardingChecklist: true,
      },
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        onboardingCompleted: true,
        firstLoginAt: new Date(),
      },
      select: {
        id: true,
        onboardingCompleted: true,
        firstLoginAt: true,
      },
    });
  }

  async recordFirstLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstLoginAt: true },
    });

    // Only set firstLoginAt if it hasn't been set before
    if (!user?.firstLoginAt) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { firstLoginAt: new Date() },
        select: {
          id: true,
          firstLoginAt: true,
        },
      });
    }

    return { id: userId, firstLoginAt: user.firstLoginAt };
  }
}