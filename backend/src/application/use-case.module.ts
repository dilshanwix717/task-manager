import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from 'src/infrastructure/configurations/base-config/config.module';
import { RoleEntity } from 'src/infrastructure/entities/role.entity';
import { UserEntity } from 'src/infrastructure/entities/user.entity';
import { TaskEntity } from 'src/infrastructure/entities/task.entity';
import {
  ISRoleRepository,
  ISTaskRepository,
  ISUserAccountRepository,
} from 'src/infrastructure/interface-symbols/repository.symbols';
import {
  ISCreateTaskUseCase,
  ISDeleteTaskUseCase,
  ISRegisterUserUseCase,
  ISRetrieveTaskByIdUseCase,
  ISRetrieveTasksUseCase,
  ISRetrieveTaskSummaryUseCase,
  ISRetrieveUsersUseCase,
  ISUpdateTaskUseCase,
  ISUserLoginUseCase,
} from 'src/infrastructure/interface-symbols/use-case.symbols';
import { RoleRepository } from 'src/infrastructure/repositories/role.repository';
import { UserAccountRepository } from 'src/infrastructure/repositories/user-account.repository';
import { TaskRepository } from 'src/infrastructure/repositories/task.repository';
import { AuthModule } from 'src/infrastructure/auth-module/auth.module';
import { RealtimeModule } from 'src/infrastructure/gateways/realtime.module';
import { RetrieveUsersUseCase } from './user-management/retrieve-users.use-case';
import { CreateTaskUseCase } from './task/create-task.use-case';
import { RetrieveTasksUseCase } from './task/retrieve-tasks.use-case';
import { RetrieveTaskByIdUseCase } from './task/retrieve-task-by-id.use-case';
import { UpdateTaskUseCase } from './task/update-task.use-case';
import { DeleteTaskUseCase } from './task/delete-task.use-case';
import { RetrieveTaskSummaryUseCase } from './task/retrieve-task-summary.use-case';
import { RegisterUserUseCase } from './auth/register-user.use-case';
import { UserLoginUseCase } from './auth/user-login.use-case';

//repositories

const repositories = [
  {
    provide: ISRoleRepository,
    useClass: RoleRepository,
  },
  {
    provide: ISUserAccountRepository,
    useClass: UserAccountRepository,
  },
  {
    provide: ISTaskRepository,
    useClass: TaskRepository,
  },
];

//use cases

const authUseCases = [
  {
    provide: ISRegisterUserUseCase,
    useClass: RegisterUserUseCase,
  },
  {
    provide: ISUserLoginUseCase,
    useClass: UserLoginUseCase,
  },
];

const userUseCases = [
  {
    provide: ISRetrieveUsersUseCase,
    useClass: RetrieveUsersUseCase,
  },
];

const taskUseCases = [
  {
    provide: ISCreateTaskUseCase,
    useClass: CreateTaskUseCase,
  },
  {
    provide: ISRetrieveTasksUseCase,
    useClass: RetrieveTasksUseCase,
  },
  {
    provide: ISRetrieveTaskByIdUseCase,
    useClass: RetrieveTaskByIdUseCase,
  },
  {
    provide: ISUpdateTaskUseCase,
    useClass: UpdateTaskUseCase,
  },
  {
    provide: ISDeleteTaskUseCase,
    useClass: DeleteTaskUseCase,
  },
  {
    provide: ISRetrieveTaskSummaryUseCase,
    useClass: RetrieveTaskSummaryUseCase,
  },
];

//services

const services = [];

@Module({
  imports: [
    ConfigurationModule,
    forwardRef(() => AuthModule),
    RealtimeModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity, TaskEntity]),
  ],
  providers: [
    ...repositories,
    ...services,
    ...authUseCases,
    ...userUseCases,
    ...taskUseCases,
  ],
  exports: [
    ...repositories,
    ...services,
    ...authUseCases,
    ...userUseCases,
    ...taskUseCases,
  ],
})
export class UseCaseModule {}
