import { Controller, Get, Post, Body, Request, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { LegalService } from './legal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/jwt-auth.decorator';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  /**
   * GET /legal/terms
   * Get the current terms and conditions (public endpoint)
   */
  @Public()
  @Get('terms')
  async getCurrentTerms() {
    const terms = await this.legalService.getCurrentTerms();
    if (!terms) {
      return {
        version: null,
        content: null,
        effectiveDate: null,
        message: 'No terms have been published yet'
      };
    }
    return terms;
  }

  /**
   * GET /legal/terms/:version
   * Get specific version of terms (public endpoint)
   */
  @Public()
  @Get('terms/:version')
  async getTermsByVersion(@Param('version') version: string) {
    return this.legalService.getTermsByVersion(version);
  }

  /**
   * GET /legal/terms/check
   * Check if user needs to accept terms (authenticated)
   */
  @UseGuards(JwtAuthGuard)
  @Get('terms/check')
  async checkTermsAcceptance(@Request() req) {
    return this.legalService.needsTermsAcceptance(req.user.sub);
  }

  /**
   * GET /legal/terms/status
   * Get user's terms acceptance status (authenticated)
   */
  @UseGuards(JwtAuthGuard)
  @Get('terms/status')
  async getTermsStatus(@Request() req) {
    return this.legalService.getUserTermsStatus(req.user.sub);
  }

  /**
   * POST /legal/terms/accept
   * Accept terms and conditions (authenticated)
   */
  @UseGuards(JwtAuthGuard)
  @Post('terms/accept')
  async acceptTerms(
    @Request() req,
    @Body() body: { version: string }
  ) {
    return this.legalService.acceptTerms(req.user.sub, body.version);
  }

  /**
   * POST /legal/terms/create
   * Create a new terms version (admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('terms/create')
  async createTermsVersion(
    @Request() req,
    @Body() body: { version: string; content: string; effectiveDate: string }
  ) {
    // Only super admins can create new terms
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only administrators can create terms versions');
    }

    return this.legalService.createTermsVersion({
      version: body.version,
      content: body.content,
      effectiveDate: new Date(body.effectiveDate),
    });
  }
}
