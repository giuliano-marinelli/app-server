import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { Session } from 'src/sessions/entities/session.entity';

import { UsersResolver } from './users.resolver';

import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Session])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule {}
