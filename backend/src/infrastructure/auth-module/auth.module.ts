import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigurationModule } from '../configurations/base-config/config.module';
import { ConfigurationService } from '../configurations/base-config/config.service';
import { AuthGuard } from './guards/auth.guards';
import { RoleGuard } from './guards/role.guards';
import { PasswordService } from './services/password.service';

@Module({
  imports: [
    ConfigurationModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        global: true,
        secret: configService.jwtConfig.secret,
        signOptions: {
          //env value like "1d", cast to the ms string format the jwt lib expects
          expiresIn: configService.jwtConfig
            .expiresIn as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    PasswordService,
    //global guards: every route needs a valid jwt (AuthGuard) and matching role (RoleGuard)
    //unless marked @Public() / without @Roles()
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [PasswordService],
})
export class AuthModule {}
