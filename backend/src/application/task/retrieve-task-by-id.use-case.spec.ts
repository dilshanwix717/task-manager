import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { RetrieveTaskByIdUseCase } from './retrieve-task-by-id.use-case';

describe('RetrieveTaskByIdUseCase', () => {
  let useCase: RetrieveTaskByIdUseCase;

  const taskRepository = {
    findById: jest.fn(),
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

  const task = {
    id: 'task-1',
    title: 'Ship the demo',
    owner: { id: 'user-1', userName: 'alice' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        RetrieveTaskByIdUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
      ],
    }).compile();

    useCase = module.get(RetrieveTaskByIdUseCase);
  });

  it('throws not found when the task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ taskId: 'missing', currentUser: owner }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects a user who does not own the task', async () => {
    taskRepository.findById.mockResolvedValue(task);

    await expect(
      useCase.execute({ taskId: 'task-1', currentUser: otherUser }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns the task to its owner', async () => {
    taskRepository.findById.mockResolvedValue(task);

    await expect(
      useCase.execute({ taskId: 'task-1', currentUser: owner }),
    ).resolves.toEqual(task);
  });

  it('returns any task to an admin', async () => {
    taskRepository.findById.mockResolvedValue(task);

    await expect(
      useCase.execute({ taskId: 'task-1', currentUser: admin }),
    ).resolves.toEqual(task);
  });
});
