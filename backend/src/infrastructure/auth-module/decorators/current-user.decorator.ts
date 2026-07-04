import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/token-payload.interface';

export interface CurrentUser {
  id: string;
  role: string;
  name: string;
}

//decorator to retrieve the user data from the jwt token
export const User = createParamDecorator(
  (data: never, ctx: ExecutionContext): CurrentUser => {
    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return {
      id: user.userId,
      role: user.role,
      name: user.name,
    };
  },
);
