import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as otplib from 'otplib';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new 2FA secret and QR code for setup
   */
  async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled. Disable it first to set up again.');
    }

    // Generate a new secret
    const secret = otplib.generateSecret({ length: 20 });

    // Create the otpauth URL for authenticator apps
    const otpauthUrl = otplib.generateURI({
      secret,
      issuer: 'Zander',
      label: user.email,
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Store the secret temporarily (not enabled yet)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });

    return {
      secret,
      qrCodeUrl,
      otpauthUrl
    };
  }

  /**
   * Verify the TOTP code and enable 2FA
   */
  async verifyAndEnable(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('No 2FA secret found. Please start setup again.');
    }

    // Verify the code
    const result = await otplib.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!result.valid) {
      throw new BadRequestException('Invalid verification code. Please try again.');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    return {
      success: true,
      message: '2FA has been enabled successfully'
    };
  }

  /**
   * Disable 2FA (requires password verification)
   */
  async disable(userId: string, password: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, twoFactorEnabled: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Disable 2FA and clear secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    return {
      success: true,
      message: '2FA has been disabled'
    };
  }

  /**
   * Verify a TOTP code during login
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    const result = await otplib.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    return result.valid;
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    return user?.twoFactorEnabled ?? false;
  }
}
