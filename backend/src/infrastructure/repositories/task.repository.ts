import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { TaskModel } from 'src/domain/models/task.model';
import { ITaskRepositoryInterface } from 'src/domain/repositories/task.repository-interface';
import {
  DeepPartial,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { Mapper } from '../utils/mappers/mapper.util';

@Injectable()
export class TaskRepository implements ITaskRepositoryInterface {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly _taskRepository: Repository<TaskEntity>,
  ) {}
  async findTasksByQuery(
    page: number,
    limit: number,
    status?: TaskStatusType,
    ownerId?: string,
  ): Promise<[TaskModel[], number]> {
    const whereCondition: FindOptionsWhere<TaskEntity> = {};

    if (status) whereCondition.status = status;

    if (ownerId) whereCondition.owner = { id: ownerId };

    const [tasks, total] = await this._taskRepository.findAndCount({
      where: whereCondition,
      relations: {
        owner: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        owner: { id: true, userName: true },
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return [Mapper.toModels(tasks, TaskModel), total];
  }
  async findById(id: string): Promise<TaskModel> {
    const task = await this._taskRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        owner: { id: true, userName: true },
        createdAt: true,
        updatedAt: true,
      },
    });

    return Mapper.toModel(task, TaskModel);
  }
  async create(
    task: DeepPartial<TaskModel>,
    entityManager?: EntityManager,
  ): Promise<TaskModel> {
    let taskInstance = Mapper.toEntity(task, TaskEntity);

    taskInstance = this._taskRepository.create(taskInstance);

    let createdTask: TaskEntity;

    if (entityManager) {
      createdTask = await entityManager.save(TaskEntity, taskInstance);
    } else {
      createdTask = await this._taskRepository.save(taskInstance);
    }

    return Mapper.toModel(createdTask, TaskModel);
  }
  async update(
    task: DeepPartial<TaskModel>,
    entityManager?: EntityManager,
  ): Promise<TaskModel> {
    let taskInstance = Mapper.toEntity(task, TaskEntity);

    taskInstance = this._taskRepository.create(taskInstance);

    let updatedTask: TaskEntity;

    if (entityManager) {
      updatedTask = await entityManager.save(TaskEntity, taskInstance);
    } else {
      updatedTask = await this._taskRepository.save(taskInstance);
    }

    return Mapper.toModel(updatedTask, TaskModel);
  }
  async deleteById(id: string): Promise<void> {
    await this._taskRepository.delete({ id });
  }
  saveMany(
    _t: TaskModel[],
    _entityManager?: EntityManager,
  ): Promise<TaskModel[]> {
    throw new Error('Method not implemented.');
  }
  findByIds(_ids: string[]): Promise<TaskModel[]> {
    throw new Error('Method not implemented.');
  }
}
