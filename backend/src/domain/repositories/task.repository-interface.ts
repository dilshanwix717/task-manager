import { TaskStatusType } from '../enums/task-status.enum';
import { TaskModel } from '../models/task.model';
import { IMainRepositoryInterface } from './main-repository.interface';

export interface ITaskRepositoryInterface
  extends IMainRepositoryInterface<TaskModel> {
  findTasksByQuery(
    page: number,
    limit: number,
    status?: TaskStatusType,
    ownerId?: string,
  ): Promise<[TaskModel[], number]>;

  deleteById(id: string): Promise<void>;
}
