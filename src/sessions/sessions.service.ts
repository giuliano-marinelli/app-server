import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Owner, PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { Session } from './entities/session.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async close(id: string, selection: SelectionInput, authUser: User) {
    // only admin can close sessions of other users
    const session = await this.sessionsRepository.findOne({
      where: Owner({ id: id }, 'user.id', authUser, [Role.ADMIN])
    });
    if (!session) throw new ConflictException('Session not found');
    if (session?.closedAt) throw new ConflictException('Session already closed');

    await this.sessionsRepository.update(Owner({ id: id }, 'user.id', authUser, [Role.ADMIN]), {
      closedAt: new Date()
    });
    return await this.sessionsRepository.findOne({
      relations: selection?.getRelations(),
      where: Owner({ id: id }, 'user.id', authUser, [Role.ADMIN])
    });
  }

  async findOne(id: string, selection: SelectionInput, authUser: User) {
    return await this.sessionsRepository.findOne({
      relations: selection?.getRelations(),
      where: Owner({ id: id }, 'user.id', authUser, [Role.ADMIN])
    });
  }

  async findMany(
    where: FindOptionsWhere<Session>,
    order: FindOptionsOrder<Session>,
    pagination: PaginationInput,
    selection: SelectionInput,
    authUser: User
  ) {
    const [set, count] = await this.sessionsRepository.findAndCount({
      relations: selection?.getRelations(),
      where: Owner(where, 'user.id', authUser, [Role.ADMIN]),
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
