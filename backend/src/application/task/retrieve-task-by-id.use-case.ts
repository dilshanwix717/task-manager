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

interface IRetrieveTaskByIdParams {
  taskId: string;
  currentUser: CurrentUser;
}

export type IRetrieveTaskByIdUseCase = IUseCase<
  IRetrieveTaskByIdParams,
  TaskModel
>;

@Injectable()
export class RetrieveTaskByIdUseCase implements IRetrieveTaskByIdUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,
  ) {}

  async execute({
    taskId,
    currentUser,
  }: IRetrieveTaskByIdParams): Promise<TaskModel> {
    const task = await this._taskRepository.findById(taskId);

    if (!task) throw new NotFoundException(`Task not found for id ${taskId}.`);

    //only the owner or an admin can view a task
    if (
      currentUser.role !== UserRoleType.ADMIN &&
      task.owner.id !== currentUser.id
    )
      throw new ForbiddenException('You do not have access to this task.');

    return task;
  }
}
