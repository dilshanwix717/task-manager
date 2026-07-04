import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { TaskModel } from 'src/domain/models/task.model';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';

interface IRetrieveTasksParams {
  page: number;
  limit: number;
  status?: TaskStatusType;
  ownerId?: string;
  currentUser: CurrentUser;
}

export type IRetrieveTasksUseCase = IUseCase<
  IRetrieveTasksParams,
  [TaskModel[], number]
>;

@Injectable()
export class RetrieveTasksUseCase implements IRetrieveTasksUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,
  ) {}

  async execute({
    page,
    limit,
    status,
    ownerId,
    currentUser,
  }: IRetrieveTasksParams): Promise<[TaskModel[], number]> {
    let ownerFilter = ownerId;

    //regular users are always scoped to their own tasks, only admins can filter by any owner
    if (currentUser.role !== UserRoleType.ADMIN) {
      if (ownerId && ownerId !== currentUser.id)
        throw new ForbiddenException('Users can only view their own tasks.');

      ownerFilter = currentUser.id;
    }

    return await this._taskRepository.findTasksByQuery(
      page,
      limit,
      status,
      ownerFilter,
    );
  }
}
