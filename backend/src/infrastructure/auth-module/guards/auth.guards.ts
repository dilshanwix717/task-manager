import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';
import { ConfigurationService } from 'src/infrastructure/configurations/base-config/config.service';
import {
  AuthenticatedRequest,
  ITokenPayload,
} from '../interfaces/token-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly _configService: ConfigurationService,

    private readonly _jwtService: JwtService,

    private readonly _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Extract token from "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');

    if (bearer.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    //verify and extract the content.
    try {
      const payload = await this._jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this._configService.jwtConfig.secret,
      });

      //attach the current user to the request so guards and decorators can read it
      request.user = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.debug(`token expired ${token}`);
      }
      throw new UnauthorizedException();
    }

    return true;
  }
}
