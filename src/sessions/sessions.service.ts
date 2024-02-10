import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { CloseSessionInput, Session } from './entities/session.entity';
import { Role, User } from 'src/users/entities/user.entity';

import { PaginationInput } from 'src/common/search/pagination.input';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async closeSession(closeSessionInput: CloseSessionInput) {
    await this.sessionsRepository.update(
      { id: closeSessionInput.id, user: closeSessionInput.user },
      { closedAt: new Date() }
    );
    return await this.sessionsRepository.findOneBy({ id: closeSessionInput.id, user: closeSessionInput.user });
  }

  async findOne(id: string, authUser: User) {
    console.log('authUser', authUser);
    return await this.sessionsRepository.findOne({
      relations: { user: true },
      where: { id: id, ...(authUser?.role == Role.ADMIN ? {} : { user: { id: authUser?.id } }) }
    });
  }

  async findAll(options: {
    where?: FindOptionsWhere<Session>;
    order?: FindOptionsOrder<Session>;
    pagination?: PaginationInput;
  }) {
    return await this.sessionsRepository.find({
      relations: { user: true },
      where: options.where,
      order: options.order,
      skip: options.pagination ? (options.pagination?.page - 1) * options.pagination?.count : null,
      take: options.pagination ? options.pagination?.count : null
    });
  }
}
