import { Test } from '@nestjs/testing';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { RetrieveTaskSummaryUseCase } from './retrieve-task-summary.use-case';

describe('RetrieveTaskSummaryUseCase', () => {
  let useCase: RetrieveTaskSummaryUseCase;

  const taskRepository = {
    countTasksByStatus: jest.fn(),
  };

  const regularUser: CurrentUser = {
    id: 'user-1',
    name: 'alice',
    role: UserRoleType.USER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        RetrieveTaskSummaryUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
      ],
    }).compile();

    useCase = module.get(RetrieveTaskSummaryUseCase);
  });

  it('scopes the counts to the current user for a regular user', async () => {
    taskRepository.countTasksByStatus.mockResolvedValue({});

    await useCase.execute({ currentUser: regularUser });

    expect(taskRepository.countTasksByStatus).toHaveBeenCalledWith('user-1');
  });

  it('sums the counts and fills missing statuses with zero', async () => {
    taskRepository.countTasksByStatus.mockResolvedValue({
      [TaskStatusType.TODO]: 3,
      [TaskStatusType.DONE]: 2,
    });

    const summary = await useCase.execute({ currentUser: regularUser });

    expect(summary).toEqual({
      todo: 3,
      inProgress: 0,
      done: 2,
      total: 5,
    });
  });

  it.todo('lets an admin see the counts across all users');
});
