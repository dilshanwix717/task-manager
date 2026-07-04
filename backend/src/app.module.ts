import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigurationModule } from './infrastructure/configurations/base-config/config.module';
import { TypeOrmConfigModule } from './infrastructure/configurations/typeorm-config/typeorm.module';
import { ApplicationStartupHook } from './infrastructure/services/application-startup.hook';
import { UseCaseModule } from './application/use-case.module';
import { AuthModule } from './infrastructure/auth-module/auth.module';
import { RequestLoggerMiddleware } from './infrastructure/common/middlewares/request-response.middlewear';
import { HealthController } from './infrastructure/controllers/BE-health-check/BE-health-check.controller';

@Module({
  imports: [
    ConfigurationModule,
    UseCaseModule,
    TypeOrmConfigModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [ApplicationStartupHook],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
