import { TaskStatusType } from '../enums/task-status.enum';
import { UserModel } from './user.model';

export class TaskModel {
  id: string;

  title: string;

  description: string;

  status: TaskStatusType;

  dueDate: Date;

  owner: Partial<UserModel>;

  createdAt: Date;

  updatedAt: Date;
}
