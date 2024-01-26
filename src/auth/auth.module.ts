import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthGuard } from './auth.guard';

import { Device, DeviceSchema } from 'src/sessions/entities/device.entity';
import { Session, SessionSchema } from 'src/sessions/entities/session.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './auth.service';

import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Device.name, schema: DeviceSchema }
    ]),
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
