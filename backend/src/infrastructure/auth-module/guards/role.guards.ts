import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../role';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';
import { AuthenticatedRequest } from '../interfaces/token-payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly _reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this._reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      return false;
    }

    if (!roles) {
      this.logger.warn(`roles were not set for the route`);
      return false;
    }

    const allowed = roles.some((role) => user.role === role);

    if (!allowed)
      this.logger.warn(
        `access was denied since ${user.role} role does not match with access roles ${roles.join(', ')}.`,
      );
    return allowed;
  }
}
