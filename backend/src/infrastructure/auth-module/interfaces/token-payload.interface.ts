import { Request } from 'express';
import { UserRoleType } from 'src/domain/enums/user-role.enum';

//shape of the payload signed into every access token
export interface ITokenPayload {
  userId: string;
  name: string;
  role: UserRoleType;
}

export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}
