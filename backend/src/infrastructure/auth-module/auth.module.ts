import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ConfigurationModule } from '../configurations/base-config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationService } from '../configurations/base-config/config.service';
import { UseCaseModule } from 'src/application/use-case.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guards';
import { RoleGuard } from './guards/role.guards';
import { PasswordService } from './services/password.service';
import { AuthController } from './controllers/auth.controller';
import { UserLoginUseCase } from './use-cases/user-login.use-case';
import { RegisterUserUseCase } from './use-cases/register-user.use-case';
import {
  ISRegisterUserUseCase,
  ISUserLoginUseCase,
} from '../interface-symbols/use-case.symbols';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigurationModule,
    forwardRef(() => UseCaseModule),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        global: true,
        secret: configService.jwtConfig.secret,
        signOptions: { expiresIn: configService.jwtConfig.expiresIn },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: ISUserLoginUseCase,
      useClass: UserLoginUseCase,
    },
    {
      provide: ISRegisterUserUseCase,
      useClass: RegisterUserUseCase,
    },
  ],
  exports: [PasswordService],
})
export class AuthModule {}
