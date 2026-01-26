import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  // Default pipeline stages for new tenants
  private readonly DEFAULT_PIPELINE_STAGES = [
    { name: 'Lead', order: 1, probability: 10, color: '#6C757D' },
    { name: 'Qualified', order: 2, probability: 25, color: '#17A2B8' },
    { name: 'Proposal', order: 3, probability: 50, color: '#007BFF' },
    { name: 'Negotiation', order: 4, probability: 75, color: '#6F42C1' },
    { name: 'Closed Won', order: 5, probability: 100, color: '#28A745' },
    { name: 'Closed Lost', order: 6, probability: 0, color: '#DC3545' },
  ];

  // Helper method to seed default pipeline stages for a tenant
  private async seedDefaultPipelineStages(tenantId: string): Promise<void> {
    const existingStages = await this.prisma.pipelineStage.findMany({
      where: { tenantId }
    });

    // Only seed if tenant has no stages
    if (existingStages.length === 0) {
      await this.prisma.pipelineStage.createMany({
        data: this.DEFAULT_PIPELINE_STAGES.map(stage => ({
          tenantId,
          name: stage.name,
          order: stage.order,
          probability: stage.probability,
          color: stage.color,
        }))
      });
    }
  }

  async register(data: {
    email: string;
    firstName: string;
    lastName: string;
    tenantId?: string;
    password: string;
  }) {
    const { email, firstName, lastName, password, tenantId } = data;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If no tenantId is provided, create a default tenant
    let tenant = tenantId ?
      await this.prisma.tenant.findUnique({ where: { id: tenantId } }) :
      await this.prisma.tenant.findFirst();

    let isNewTenant = false;

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          companyName: 'Default Tenant',
          subdomain: 'default'
        }
      });
      isNewTenant = true;
    }

    // Seed default pipeline stages for new tenants
    if (isNewTenant) {
      await this.seedDefaultPipelineStages(tenant.id);
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        tenantId: tenant.id
      }
    });

    return user;
  }

  async login(loginData: { email: string; password: string }) {
    const { email, password } = loginData;

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin || false
      },
      token
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        emailNotifications: true,
        dealAlerts: true,
        taskReminders: true,
        assemblyReminders: true,
        weeklyDigest: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    timezone?: string;
    emailNotifications?: boolean;
    dealAlerts?: boolean;
    taskReminders?: boolean;
    assemblyReminders?: boolean;
    weeklyDigest?: boolean;
  }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        timezone: data.timezone,
        emailNotifications: data.emailNotifications,
        dealAlerts: data.dealAlerts,
        taskReminders: data.taskReminders,
        assemblyReminders: data.assemblyReminders,
        weeklyDigest: data.weeklyDigest,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        emailNotifications: true,
        dealAlerts: true,
        taskReminders: true,
        assemblyReminders: true,
        weeklyDigest: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  private generateToken(user: {
    isSuperAdmin?: boolean;
    id: string;
    email: string;
    tenantId: string;
  }) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        isSuperAdmin: user.isSuperAdmin || false
      },
      jwtSecret,
      { expiresIn: '1d' }
    );
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists, a reset email has been sent' };
    }

    // Generate secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // Send email via Resend
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      const resetUrl = `https://app.zanderos.com/reset-password?token=${resetToken}`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Zander <noreply@zanderos.com>',
          to: email,
          subject: 'Reset Your Password',
          html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
        })
      });
    }

    return { message: 'If an account exists, a reset email has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return { message: 'Password reset successful' };
  }

  // Generate token with specific tenantId for tenant switching
  generateTokenForTenant(user: {
    id: string;
    email: string;
    isSuperAdmin?: boolean;
  }, tenantId: string) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: tenantId,
        isSuperAdmin: user.isSuperAdmin || false
      },
      jwtSecret,
      { expiresIn: '1d' }
    );
  }
}
