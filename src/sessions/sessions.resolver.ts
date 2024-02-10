import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GraphQLUUID } from 'graphql-scalars';
import { Action } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/casl.decorator';
import { TypeORMOrderTransform, TypeORMWhereTransform } from 'src/common/search/search';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { CloseSessionInput, Session, SessionOrderInput, SessionWhereInput } from './entities/session.entity';

import { PaginationInput } from 'src/common/search/pagination.input';

import { SessionsService } from './sessions.service';

@Resolver(() => Session)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: Session.name,
    fields: args.closeSessionInput
  }))
  @Mutation(() => Session, { nullable: true })
  async closeSession(@Args('closeSessionInput') closeSessionInput: CloseSessionInput) {
    return await this.sessionsService.closeSession(closeSessionInput);
  }

  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Session.name
  }))
  @Query(() => Session, { name: 'session', nullable: true })
  async findOne(@Args('id', { type: () => GraphQLUUID }) id: string, @Context() context) {
    return await this.sessionsService.findOne(id, context?.req?.user);
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
    @Args('pagination', { nullable: true }) pagination: PaginationInput
  ) {
    return await this.sessionsService.findAll({ where, order, pagination });
  }
}
