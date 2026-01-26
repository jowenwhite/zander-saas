import { Controller, Post, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { Public } from '../auth/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
  ) {}

  /**
   * POST /admin/seed-marketing
   *
   * Seeds marketing data for 64 West Holdings tenant.
   * Protected by ADMIN_SECRET_KEY header check.
   *
   * Usage:
   *   curl -X POST https://api.zanderos.com/admin/seed-marketing \
   *     -H "x-admin-secret: YOUR_SECRET_KEY"
   */
  @Public()
  @Post('seed-marketing')
  @HttpCode(200)
  async seedMarketing(@Headers('x-admin-secret') secretKey: string) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    return this.adminService.seedMarketing();
  }

  /**
   * POST /admin/seed-knowledge
   *
   * Seeds initial knowledge base articles for the platform.
   * Protected by ADMIN_SECRET_KEY header check.
   *
   * Usage:
   *   curl -X POST https://api.zanderos.com/admin/seed-knowledge \
   *     -H "x-admin-secret: YOUR_SECRET_KEY"
   */
  @Public()
  @Post('seed-knowledge')
  @HttpCode(200)
  async seedKnowledge(@Headers('x-admin-secret') secretKey: string) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    return this.adminService.seedKnowledge();
  }
}
