import { RoleModel } from './role.model';
import { TaskModel } from './task.model';

export class UserModel {
  id: string;

  userName: string;

  email: string;

  password: string;

  status: boolean;

  role: Partial<RoleModel>;

  tasks?: Partial<TaskModel>[];

  createdAt: Date;

  updatedAt: Date;
}
