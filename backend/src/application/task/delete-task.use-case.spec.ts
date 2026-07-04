import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { ISTaskEventsPublisher } from 'src/infrastructure/interface-symbols/service.symbols';
import { DeleteTaskUseCase } from './delete-task.use-case';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;

  const taskRepository = {
    findById: jest.fn(),
    deleteById: jest.fn(),
  };

  const taskEventsPublisher = {
    publishTaskDeleted: jest.fn(),
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

  const admin: CurrentUser = {
    id: 'admin-1',
    name: 'admin',
    role: UserRoleType.ADMIN,
  };

  const existingTask = {
    id: 'task-1',
    title: 'Ship the demo',
    owner: { id: 'user-1', userName: 'alice' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        DeleteTaskUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
        { provide: ISTaskEventsPublisher, useValue: taskEventsPublisher },
      ],
    }).compile();

    useCase = module.get(DeleteTaskUseCase);
  });

  it('throws not found when the task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ taskId: 'missing', currentUser: owner }),
    ).rejects.toThrow(NotFoundException);

    expect(taskRepository.deleteById).not.toHaveBeenCalled();
  });

  it('rejects a user who does not own the task', async () => {
    taskRepository.findById.mockResolvedValue(existingTask);

    await expect(
      useCase.execute({ taskId: 'task-1', currentUser: otherUser }),
    ).rejects.toThrow(ForbiddenException);

    expect(taskRepository.deleteById).not.toHaveBeenCalled();
  });

  it('deletes the task for its owner and publishes task.deleted', async () => {
    taskRepository.findById.mockResolvedValue(existingTask);

    const result = await useCase.execute({
      taskId: 'task-1',
      currentUser: owner,
    });

    expect(taskRepository.deleteById).toHaveBeenCalledWith('task-1');
    expect(taskEventsPublisher.publishTaskDeleted).toHaveBeenCalledWith(
      existingTask,
    );
    expect(result).toEqual(existingTask);
  });

  it('allows an admin to delete any task', async () => {
    taskRepository.findById.mockResolvedValue(existingTask);

    await useCase.execute({ taskId: 'task-1', currentUser: admin });

    expect(taskRepository.deleteById).toHaveBeenCalledWith('task-1');
  });
});
