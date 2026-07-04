import { Test } from '@nestjs/testing';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { CurrentUser } from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ISTaskRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { ISTaskEventsPublisher } from 'src/infrastructure/interface-symbols/service.symbols';
import { CreateTaskUseCase } from './create-task.use-case';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;

  const taskRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  const taskEventsPublisher = {
    publishTaskCreated: jest.fn(),
  };

  const currentUser: CurrentUser = {
    id: 'user-1',
    name: 'alice',
    role: UserRoleType.USER,
  };

  const persistedTask = {
    id: 'task-1',
    title: 'Ship the demo',
    status: TaskStatusType.TODO,
    owner: { id: 'user-1', userName: 'alice' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        { provide: ISTaskRepository, useValue: taskRepository },
        { provide: ISTaskEventsPublisher, useValue: taskEventsPublisher },
      ],
    }).compile();

    useCase = module.get(CreateTaskUseCase);
  });

  it('creates the task with the current user as the owner', async () => {
    taskRepository.create.mockResolvedValue({ id: 'task-1' });
    taskRepository.findById.mockResolvedValue(persistedTask);

    const result = await useCase.execute({
      title: 'Ship the demo',
      dueDate: '2026-07-30T00:00:00.000Z',
      currentUser,
    });

    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ship the demo',
        owner: { id: 'user-1' },
      }),
    );
    expect(result).toEqual(persistedTask);
  });

  it('publishes a task.created event with the stored task', async () => {
    taskRepository.create.mockResolvedValue({ id: 'task-1' });
    taskRepository.findById.mockResolvedValue(persistedTask);

    await useCase.execute({
      title: 'Ship the demo',
      dueDate: '2026-07-30T00:00:00.000Z',
      currentUser,
    });

    expect(taskEventsPublisher.publishTaskCreated).toHaveBeenCalledWith(
      persistedTask,
    );
  });
});
