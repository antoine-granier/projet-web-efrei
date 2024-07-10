import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    if (request.handshake && request.handshake.headers) {
      // WebSocket request
      const authorizationHeader = request.handshake.headers.authorization;
      if (authorizationHeader) {
          const [type, token] = authorizationHeader.split(' ');
          return type === 'Bearer' ? token : undefined;
      }
  } else if (request.headers) {
      // HTTP request
      const authorizationHeader = request.headers.authorization;
      if (authorizationHeader) {
          const [type, token] = authorizationHeader.split(' ');
          return type === 'Bearer' ? token : undefined;
      }
  }
  }
}
