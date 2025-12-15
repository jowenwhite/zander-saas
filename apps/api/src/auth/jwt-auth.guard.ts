import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Extract tenantId from JWT payload
      if (!decoded.tenantId) {
        throw new UnauthorizedException('Token missing tenantId');
      }

      // Inject both user and tenantId into request
      request.user = {
        userId: decoded.sub,
        email: decoded.email,
        tenantId: decoded.tenantId
      };
      
      // Also add tenantId directly to request for easy access
      request.tenantId = decoded.tenantId;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
