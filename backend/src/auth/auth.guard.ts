import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = this.getContext(context);
    const token = this.extractTokenFromHeader(ctx.req);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });
      ctx.req.user = payload;
    } catch (err) {
      throw new UnauthorizedException('Token validation failed');
    }

    return true;
  }

  private getContext(context: ExecutionContext) {
    if (context.getType().toString() === 'graphql') {
      return { req: GqlExecutionContext.create(context).getContext().req };
    } else if (context.getType().toString() === 'ws') {
      return { req: context.switchToWs().getClient().handshake };
    }
    return { req: context.switchToHttp().getRequest() };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authorizationHeader = request?.headers?.authorization;
    if (authorizationHeader) {
      const [type, token] = authorizationHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    return undefined;
  }
}
