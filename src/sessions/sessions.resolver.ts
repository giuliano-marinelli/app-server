import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  AuthUser,
  PaginationInput,
  SelectionInput,
  SelectionSet,
  TypeORMOrderTransform,
  TypeORMWhereTransform
} from '@nestjs!/graphql-filter';

import { Action } from '../casl/casl.factory';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { GraphQLUUID } from 'graphql-scalars';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Session, SessionOrderInput, SessionWhereInput, Sessions } from './entities/session.entity';

import { SessionsService } from './sessions.service';

@Resolver(() => Session)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @CheckPolicies(() => ({
    action: Action.Update,
    subject: Session.name
  }))
  @Mutation(() => Session, { name: 'closeSession', nullable: true })
  async close(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.sessionsService.close(id, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Session.name
  }))
  @Query(() => Session, { name: 'session', nullable: true })
  async findOne(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.sessionsService.findOne(id, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: Session.name,
    fields: args.where
  }))
  @Query(() => Sessions, { name: 'sessions' })
  async findMany(
    @Args('where', { type: () => [SessionWhereInput], nullable: true }, TypeORMWhereTransform<Session>)
    where: FindOptionsWhere<Session>,
    @Args(
      'order',
      { type: () => [SessionOrderInput], defaultValue: [{ createdAt: 'ASC' }] },
      TypeORMOrderTransform<Session>
    )
    order: FindOptionsOrder<Session>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.sessionsService.findMany(where, order, pagination, selection, authUser);
  }
}
