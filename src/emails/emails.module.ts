import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Email } from './entities/email.entity';
import { User } from 'src/users/entities/user.entity';

import { EmailsResolver } from './emails.resolver';

import { EmailsService } from './emails.service';

@Module({
  imports: [TypeOrmModule.forFeature([Email, User])],
  providers: [EmailsResolver, EmailsService],
  exports: [EmailsService, TypeOrmModule]
})
export class EmailsModule {}
