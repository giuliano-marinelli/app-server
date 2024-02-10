import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from './entities/device.entity';
import { Session } from './entities/session.entity';

import { SessionsResolver } from './sessions.resolver';

import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Device])],
  providers: [SessionsResolver, SessionsService],
  exports: [SessionsService, TypeOrmModule]
})
export class SessionsModule {}
