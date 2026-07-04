import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from 'src/infrastructure/configurations/base-config/config.module';
import { RoleEntity } from 'src/infrastructure/entities/role.entity';
import { UserEntity } from 'src/infrastructure/entities/user.entity';
import { TaskEntity } from 'src/infrastructure/entities/task.entity';
import {
  ISRoleRepository,
  ISUserAccountRepository,
} from 'src/infrastructure/interface-symbols/repository.symbols';
import { RoleRepository } from 'src/infrastructure/repositories/role.repository';
import { UserAccountRepository } from 'src/infrastructure/repositories/user-account.repository';
import { AuthModule } from 'src/infrastructure/auth-module/auth.module';

//============================================================== REPOSITORIES ==============================================================

const repositories = [
  {
    provide: ISRoleRepository,
    useClass: RoleRepository,
  },
  {
    provide: ISUserAccountRepository,
    useClass: UserAccountRepository,
  },
];

//============================================================== USE CASES ==============================================================

const userUseCases = [];

const taskUseCases = [];

//============================================================== SERVICES ==============================================================

const services = [];

@Module({
  imports: [
    ConfigurationModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity, RoleEntity, TaskEntity]),
  ],
  providers: [...repositories, ...services, ...userUseCases, ...taskUseCases],
  exports: [...repositories, ...services, ...userUseCases, ...taskUseCases],
})
export class UseCaseModule {}
