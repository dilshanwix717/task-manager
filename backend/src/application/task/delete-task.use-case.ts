import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { TaskModel } from 'src/domain/models/task.model';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';

interface IDeleteTaskParams {
  taskId: string;
  currentUser: CurrentUser;
}

export type IDeleteTaskUseCase = IUseCase<IDeleteTaskParams, TaskModel>;

@Injectable()
export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,
  ) {}

  async execute({
    taskId,
    currentUser,
  }: IDeleteTaskParams): Promise<TaskModel> {
    const existingTask = await this._taskRepository.findById(taskId);

    if (!existingTask)
      throw new NotFoundException(`Task not found for id ${taskId}.`);

    //only the owner or an admin can delete a task
    if (
      currentUser.role !== UserRoleType.ADMIN &&
      existingTask.owner.id !== currentUser.id
    )
      throw new ForbiddenException('You do not have access to this task.');

    await this._taskRepository.deleteById(taskId);

    //return the deleted task so callers (and realtime events later) know what was removed
    return existingTask;
  }
}
