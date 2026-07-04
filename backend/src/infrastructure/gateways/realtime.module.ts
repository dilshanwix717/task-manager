import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configurations/base-config/config.module';
import { ISTaskEventsPublisher } from '../interface-symbols/service.symbols';
import { TasksGateway } from './tasks.gateway';

@Module({
  imports: [ConfigurationModule],
  providers: [
    TasksGateway,
    {
      provide: ISTaskEventsPublisher,
      useExisting: TasksGateway,
    },
  ],
  exports: [ISTaskEventsPublisher],
})
export class RealtimeModule {}
