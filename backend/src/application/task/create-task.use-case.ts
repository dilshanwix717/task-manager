import { Inject, Injectable } from '@nestjs/common';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { TaskModel } from 'src/domain/models/task.model';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ITaskEventsPublisher } from 'src/infrastructure/gateways/task-events-publisher.interface';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { ISTaskEventsPublisher } from 'src/infrastructure/interface-symbols/service.symbols';

interface ICreateTaskParams {
  title: string;
  description?: string;
  status?: TaskStatusType;
  dueDate: string;
  currentUser: CurrentUser;
}

export type ICreateTaskUseCase = IUseCase<ICreateTaskParams, TaskModel>;

@Injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @Inject(ISTaskRepository)
    private readonly _taskRepository: ITaskRepositoryInterface,

    @Inject(ISTaskEventsPublisher)
    private readonly _taskEventsPublisher: ITaskEventsPublisher,
  ) {}

  async execute({
    title,
    description,
    status,
    dueDate,
    currentUser,
  }: ICreateTaskParams): Promise<TaskModel> {
    const task = new TaskModel();
    task.title = title;
    task.dueDate = new Date(dueDate);

    //the creator always becomes the owner of the task
    task.owner = { id: currentUser.id };

    if (description !== undefined) task.description = description;

    if (status !== undefined) task.status = status;

    const createdTask = await this._taskRepository.create(task);

    //fetch again so the response and the realtime event carry the owner details
    const taskWithOwner = await this._taskRepository.findById(createdTask.id);

    this._taskEventsPublisher.publishTaskCreated(taskWithOwner);

    return taskWithOwner;
  }
}
