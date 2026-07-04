import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from './config.service';

// This module is responsible for loading and managing configuration settings
const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    // Add any configuration modules here, e.g., ConfigModule.forRoot()
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config-files/${environment}.env`,
      cache: true,
    }),
  ],
  exports: [ConfigurationService],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
