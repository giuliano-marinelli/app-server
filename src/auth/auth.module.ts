import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './auth.service';

import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('SECRET_TOKEN'),
        signOptions: {}
      })
    }),
    SharedModule
  ],
  providers: [AuthResolver, AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService]
})
export class AuthModule {}
