import { Controller, Post, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './jwt-auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    tenantId?: string;
  }) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginUserDto: { email: string; password: string }) {
    return this.authService.login(loginUserDto);
  }

  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      timezone?: string;
      emailNotifications?: boolean;
      dealAlerts?: boolean;
      taskReminders?: boolean;
      assemblyReminders?: boolean;
      weeklyDigest?: boolean;
    }
  ) {
    return this.authService.updateProfile(req.user.sub, updateData);
  }
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

}
