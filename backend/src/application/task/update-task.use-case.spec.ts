import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { ISTaskEventsPublisher } from 'src/infrastructure/interface-symbols/service.symbols';
import { UpdateTaskUseCase } from './update-task.use-case';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;

  const taskRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const taskEventsPublisher = {
    publishTaskUpdated: jest.fn(),
  };

  const owner: CurrentUser = {
    id: 'user-1',
    name: 'alice',
    role: UserRoleType.USER,
  };

  const otherUser: CurrentUser = {
    id: 'user-2',
    name: 'bob',
    role: UserRoleType.USER,
  };

  const existingTask = {
    id: 'task-1',
    title: 'Ship the demo',
    status: TaskStatusType.TODO,
    owner: { id: 'user-1', userName: 'alice' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UpdateTaskUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
        { provide: ISTaskEventsPublisher, useValue: taskEventsPublisher },
      ],
    }).compile();

    useCase = module.get(UpdateTaskUseCase);
  });

  it('throws not found when the task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ taskId: 'missing', currentUser: owner }),
    ).rejects.toThrow(NotFoundException);

    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('rejects a user who does not own the task', async () => {
    taskRepository.findById.mockResolvedValue(existingTask);

    await expect(
      useCase.execute({
        taskId: 'task-1',
        title: 'hijacked',
        currentUser: otherUser,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('applies only the fields present in the request', async () => {
    const updatedTask = { ...existingTask, status: TaskStatusType.DONE };
    taskRepository.findById
      .mockResolvedValueOnce(existingTask)
      .mockResolvedValueOnce(updatedTask);

    const result = await useCase.execute({
      taskId: 'task-1',
      status: TaskStatusType.DONE,
      currentUser: owner,
    });

    expect(taskRepository.update).toHaveBeenCalledWith({
      id: 'task-1',
      status: TaskStatusType.DONE,
    });
    expect(result).toEqual(updatedTask);
  });

  it('publishes a task.updated event with the fresh task', async () => {
    const updatedTask = { ...existingTask, title: 'New title' };
    taskRepository.findById
      .mockResolvedValueOnce(existingTask)
      .mockResolvedValueOnce(updatedTask);

    await useCase.execute({
      taskId: 'task-1',
      title: 'New title',
      currentUser: owner,
    });

    expect(taskEventsPublisher.publishTaskUpdated).toHaveBeenCalledWith(
      updatedTask,
    );
  });
});
