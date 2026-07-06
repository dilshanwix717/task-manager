import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigurationModule } from './infrastructure/configurations/base-config/config.module';
import { TypeOrmConfigModule } from './infrastructure/configurations/typeorm-config/typeorm.module';
import { ApplicationStartupHook } from './infrastructure/services/application-startup.hook';
import { UseCaseModule } from './application/use-case.module';
import { AuthModule } from './infrastructure/auth-module/auth.module';
import { RequestLoggerMiddleware } from './infrastructure/common/middlewares/request-response.middlewear';
import { HealthController } from './infrastructure/controllers/BE-health-check/BE-health-check.controller';
import { AuthController } from './infrastructure/controllers/auth/auth.controller';
import { TaskController } from './infrastructure/controllers/task/task.controller';
import { UserManagementController } from './infrastructure/controllers/user-management/user-management.controller';

@Module({
  imports: [
    ConfigurationModule,
    UseCaseModule,
    TypeOrmConfigModule,
    AuthModule,
    //global rate limiting on the public edge, disabled while running tests
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
        skipIf: () => process.env.NODE_ENV === 'test',
      },
    ]),
  ],
  controllers: [
    HealthController,
    AuthController,
    TaskController,
    UserManagementController,
  ],
  providers: [
    ApplicationStartupHook,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
