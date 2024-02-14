import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  AuthUser,
  PaginationInput,
  SelectionInput,
  SelectionSet,
  TypeORMOrderTransform,
  TypeORMWhereTransform
} from '@nestjs!/graphql-filter';

import { GraphQLUUID } from 'graphql-scalars';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { Session, SessionOrderInput, SessionWhereInput } from './entities/session.entity';
import { User } from 'src/users/entities/user.entity';

import { SessionsService } from './sessions.service';

@Resolver(() => Session)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: Session.name,
    fields: { id: args.id }
  }))
  @Mutation(() => Session, { nullable: true })
  async closeSession(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.sessionsService.closeSession(id, selection, authUser);
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
  @Query(() => [Session], { name: 'sessions', nullable: 'items' })
  async findAll(
    @Args('where', { type: () => [SessionWhereInput], nullable: true }, TypeORMWhereTransform<Session>)
    where: FindOptionsWhere<Session>,
    @Args('order', { type: () => [SessionOrderInput], nullable: true }, TypeORMOrderTransform<Session>)
    order: FindOptionsOrder<Session>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.sessionsService.findAll(where, order, pagination, selection, authUser);
  }
}
