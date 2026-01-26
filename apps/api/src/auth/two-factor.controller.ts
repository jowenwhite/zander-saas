import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  /**
   * POST /auth/2fa/setup
   * Generate a new 2FA secret and return QR code for setup
   */
  @Post('setup')
  async setup(@Request() req) {
    return this.twoFactorService.generateSecret(req.user.sub);
  }

  /**
   * POST /auth/2fa/verify
   * Verify the TOTP code and enable 2FA
   */
  @Post('verify')
  async verify(
    @Request() req,
    @Body() body: { code: string }
  ) {
    return this.twoFactorService.verifyAndEnable(req.user.sub, body.code);
  }

  /**
   * POST /auth/2fa/disable
   * Disable 2FA (requires password confirmation)
   */
  @Post('disable')
  async disable(
    @Request() req,
    @Body() body: { password: string }
  ) {
    return this.twoFactorService.disable(req.user.sub, body.password);
  }
}
