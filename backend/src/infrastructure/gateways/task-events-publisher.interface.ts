import { TaskModel } from 'src/domain/models/task.model';

//port used by the task use cases to broadcast changes to connected clients
export interface ITaskEventsPublisher {
  publishTaskCreated(task: TaskModel): void;

  publishTaskUpdated(task: TaskModel): void;

  publishTaskDeleted(task: TaskModel): void;
}
