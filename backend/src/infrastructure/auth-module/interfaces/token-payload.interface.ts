import { Request } from 'express';

//shape of the payload signed into every access token
export interface ITokenPayload {
  userId: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}
