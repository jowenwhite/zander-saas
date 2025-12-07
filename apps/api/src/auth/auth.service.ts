import { ConfigService } from '@nestjs/config';
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto, LoginUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
  private prisma: PrismaService,
  private configService: ConfigService
) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, companyName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create tenant and user
    const tenant = await this.prisma.tenant.create({
      data: {
        companyName,
        subdomain: companyName.toLowerCase().replace(/\s+/g, '-')
      }
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId: tenant.id
      }
    });

    // Generate JWT
    const token = this.generateJwt(user);

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      }, 
      token 
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Find user
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateJwt(user);

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      }, 
      token 
    };
  }

private generateJwt(user: any) {
  const payload = {
    sub: user.id,
    email: user.email,
    tenantId: user.tenantId
  };

  const jwtSecret = this.configService.get<string>('JWT_SECRET');
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '24h'
  });
}
