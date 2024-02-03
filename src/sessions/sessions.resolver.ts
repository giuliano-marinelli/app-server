import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GraphQLObjectID } from 'graphql-scalars';
import { Schema as MongooseSchema } from 'mongoose';
import { Action } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/casl.decorator';

import { Session } from './entities/session.entity';
import { User } from 'src/users/entities/user.entity';

import { FilterSessionInput } from './dto/filter-session.input';
import { PaginationInput } from 'src/search/dto/pagination.input';
import { SortInput } from 'src/search/dto/sort.input';

import { SessionsService } from './sessions.service';
import { UsersService } from 'src/users/users.service';

@Resolver(() => Session)
export class SessionsResolver {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService
  ) {}

  @Query(() => [Session], { name: 'sessions' })
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: Session.name,
    fields: args.filter
  }))
  async findAll(
    @Args('search', { nullable: true }) search: string,
    @Args('filter', { nullable: false }) filter: FilterSessionInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort: SortInput[],
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @Args('optional', { defaultValue: false }) optional: boolean
  ) {
    return await this.sessionsService.findAll({ search, filter, sort, pagination, optional });
  }

  @Query(() => Session, { name: 'session' })
  async findOne(@Args('id', { type: () => GraphQLObjectID }) id: MongooseSchema.Types.ObjectId) {
    return await this.sessionsService.findOne(id);
  }

  @ResolveField(() => User)
  async user(@Parent() session: Session) {
    return await this.usersService.findOne(session.user);
  }
}
