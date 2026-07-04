import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { RetrieveTasksUseCase } from './retrieve-tasks.use-case';

describe('RetrieveTasksUseCase', () => {
  let useCase: RetrieveTasksUseCase;

  const taskRepository = {
    findTasksByQuery: jest.fn(),
  };

  const regularUser: CurrentUser = {
    id: 'user-1',
    name: 'alice',
    role: UserRoleType.USER,
  };

  const adminUser: CurrentUser = {
    id: 'admin-1',
    name: 'admin',
    role: UserRoleType.ADMIN,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    taskRepository.findTasksByQuery.mockResolvedValue([[], 0]);

    const module = await Test.createTestingModule({
      providers: [
        RetrieveTasksUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
      ],
    }).compile();

    useCase = module.get(RetrieveTasksUseCase);
  });

  it('scopes a regular user to their own tasks', async () => {
    await useCase.execute({ page: 1, limit: 10, currentUser: regularUser });

    expect(taskRepository.findTasksByQuery).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      'user-1',
    );
  });

  it('allows a regular user to pass their own id as the owner filter', async () => {
    await useCase.execute({
      page: 1,
      limit: 10,
      ownerId: 'user-1',
      currentUser: regularUser,
    });

    expect(taskRepository.findTasksByQuery).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      'user-1',
    );
  });

  it('rejects a regular user filtering by another owner', async () => {
    await expect(
      useCase.execute({
        page: 1,
        limit: 10,
        ownerId: 'someone-else',
        currentUser: regularUser,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(taskRepository.findTasksByQuery).not.toHaveBeenCalled();
  });

  it('lets an admin see everything when no owner filter is given', async () => {
    await useCase.execute({
      page: 2,
      limit: 5,
      status: TaskStatusType.DONE,
      currentUser: adminUser,
    });

    expect(taskRepository.findTasksByQuery).toHaveBeenCalledWith(
      2,
      5,
      TaskStatusType.DONE,
      undefined,
    );
  });

  it('lets an admin filter by any owner', async () => {
    await useCase.execute({
      page: 1,
      limit: 10,
      ownerId: 'user-1',
      currentUser: adminUser,
    });

    expect(taskRepository.findTasksByQuery).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      'user-1',
    );
  });
});
