import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Email } from './entities/email.entity';

import { EmailsResolver } from './emails.resolver';

import { EmailsService } from './emails.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Email,
      User
    ])
  ],
  providers: [
    EmailsResolver,
    EmailsService
  ],
  exports: [
    EmailsService,
    TypeOrmModule
  ]
})
export class EmailsModule {}
