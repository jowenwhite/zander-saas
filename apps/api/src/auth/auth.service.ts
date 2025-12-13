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

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          companyName: 'Default Tenant',
          subdomain: 'default'
        }
      });
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
        lastName: user.lastName
      },
      token
    };
  }

  private generateToken(user: {
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
        tenantId: user.tenantId 
      }, 
      jwtSecret, 
      { expiresIn: '1d' }
    );
  }
}
