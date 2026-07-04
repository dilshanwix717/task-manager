import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from '../base-config/config.module';
import { ConfigurationService } from '../base-config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        type: 'postgres',
        host: configService.dbConfig.host,
        port: configService.dbConfig.port,
        username: configService.dbConfig.username,
        password: configService.dbConfig.password,
        database: configService.dbConfig.database,
        autoLoadEntities: true,
        synchronize: true, // dev convenience — migrations are the production path
        // logging: ['schema', 'error'],
      }),
    }),
  ],
})
export class TypeOrmConfigModule {}
