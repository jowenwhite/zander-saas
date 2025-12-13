import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './jwt-auth.decorator';

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
}
