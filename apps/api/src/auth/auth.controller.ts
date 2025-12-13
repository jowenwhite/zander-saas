import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('login')
  async login(@Body() loginUserDto: { email: string; password: string }) {
    return this.authService.login(loginUserDto);
  }
}
