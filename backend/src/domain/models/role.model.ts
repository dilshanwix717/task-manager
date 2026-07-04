import { UserModel } from './user.model';

export class RoleModel {
  id: string;

  name: string;

  users: Partial<UserModel>[];

  createdAt: Date;

  updatedAt: Date;
}
