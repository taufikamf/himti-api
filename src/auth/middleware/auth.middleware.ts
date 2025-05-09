import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const fullPath = `${req.baseUrl}${req.path}`;

    // Skip auth routes
    if (fullPath.includes('/api/v1/auth')) {
      return next();
    }

    // Skip OPTIONS requests
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Skip specific public endpoints (forum list and article list)
    if (
      fullPath.includes('/api/v1/forums') && req.method === 'GET' && !fullPath.includes('/my-forums') ||
      fullPath.includes('/api/v1/articles') && req.method === 'GET' && !fullPath.includes('/my-articles') ||
      fullPath.includes('/api/v1/galleries') && req.method === 'GET' ||
      fullPath.includes('/api/v1/events') && req.method === 'GET' ||
      fullPath.includes('/api/v1/departments') && req.method === 'GET' ||
      fullPath.includes('/api/v1/divisions') && req.method === 'GET' ||
      fullPath.includes('/api/v1/members') && req.method === 'GET' ||
      fullPath.includes('/api/v1/forums') && fullPath.includes('/like') ||
      fullPath.includes('/api/v1/articles') && fullPath.includes('/like')
    ) {
      // For like endpoints, we still want to authenticate if a token is provided
      // This allows public access but also sets the user if they are authenticated
      if ((fullPath.includes('/like') && req.method === 'POST') && req.cookies['auth_token']) {
        try {
          const token = req.cookies['auth_token'];
          const payload = this.jwtService.verify(token);
          const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              profile_picture: true,
            },
          });
          
          if (user) {
            req['user'] = user;
          }
        } catch (error) {
          // If token verification fails, continue without setting user
          // The controller will handle the case where user is not set
        }
      }
      
      return next();
    }

    try {
      const token = req.cookies['auth_token'];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profile_picture: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
} 