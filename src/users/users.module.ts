import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './entities/user.entity';
import { Session, SessionSchema } from 'src/sessions/entities/session.entity';

import { UsersResolver } from './users.resolver';

import { UsersService } from './users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema }
    ])
  ],
  providers: [UsersResolver, UsersService, SessionsService],
  exports: [UsersService]
})
export class UsersModule {}
