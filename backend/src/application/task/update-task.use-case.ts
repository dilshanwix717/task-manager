import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { TaskModel } from 'src/domain/models/task.model';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { DeepPartial } from 'typeorm';

interface IUpdateTaskParams {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatusType;
  dueDate?: string;
  currentUser: CurrentUser;
}

export type IUpdateTaskUseCase = IUseCase<IUpdateTaskParams, TaskModel>;

@Injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,
  ) {}

  async execute({
    taskId,
    title,
    description,
    status,
    dueDate,
    currentUser,
  }: IUpdateTaskParams): Promise<TaskModel> {
    const existingTask = await this._taskRepository.findById(taskId);

    if (!existingTask)
      throw new NotFoundException(`Task not found for id ${taskId}.`);

    //only the owner or an admin can update a task
    if (
      currentUser.role !== UserRoleType.ADMIN &&
      existingTask.owner.id !== currentUser.id
    )
      throw new ForbiddenException('You do not have access to this task.');

    //apply only the fields sent in the request
    const changes: DeepPartial<TaskModel> = { id: taskId };

    if (title !== undefined) changes.title = title;

    if (description !== undefined) changes.description = description;

    if (status !== undefined) changes.status = status;

    if (dueDate !== undefined) changes.dueDate = new Date(dueDate);

    await this._taskRepository.update(changes);

    return await this._taskRepository.findById(taskId);
  }
}
