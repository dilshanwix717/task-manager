import { Inject, Injectable } from '@nestjs/common';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';

interface IRetrieveTaskSummaryParams {
  currentUser: CurrentUser;
}

export interface ITaskSummary {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

export type IRetrieveTaskSummaryUseCase = IUseCase<
  IRetrieveTaskSummaryParams,
  ITaskSummary
>;

@Injectable()
export class RetrieveTaskSummaryUseCase implements IRetrieveTaskSummaryUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,
  ) {}

  async execute({
    currentUser,
  }: IRetrieveTaskSummaryParams): Promise<ITaskSummary> {
    //regular users only see their own numbers, admins see the global picture
    const ownerId =
      currentUser.role === UserRoleType.ADMIN ? undefined : currentUser.id;

    const counts = await this._taskRepository.countTasksByStatus(ownerId);

    const todo = counts[TaskStatusType.TODO] ?? 0;
    const inProgress = counts[TaskStatusType.IN_PROGRESS] ?? 0;
    const done = counts[TaskStatusType.DONE] ?? 0;

    return {
      todo,
      inProgress,
      done,
      total: todo + inProgress + done,
    };
  }
}
