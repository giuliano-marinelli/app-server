import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Session, SessionSchema } from './entities/session.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';

import { SessionsResolver } from './sessions.resolver';

import { SessionsService } from './sessions.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [SessionsResolver, SessionsService, UsersService],
  exports: [SessionsService]
})
export class SessionsModule {}
