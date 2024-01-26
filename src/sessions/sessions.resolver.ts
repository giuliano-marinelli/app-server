import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Schema as MongooseSchema } from 'mongoose';
import { Public } from 'src/auth/decorators/public.decorator';

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
  async findAll(
    @Args('search', { nullable: true }) search: string,
    @Args('filter', { nullable: true }) filter: FilterSessionInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort: SortInput[],
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @Args('optional', { defaultValue: false }) optional: boolean
  ) {
    return await this.sessionsService.findAll({ search, filter, sort, pagination, optional });
  }

  @Query(() => Session, { name: 'session' })
  async findOne(@Args('id', { type: () => String }) id: MongooseSchema.Types.ObjectId) {
    return await this.sessionsService.findOne(id);
  }

  @ResolveField(() => User)
  async user(@Parent() session: Session) {
    return await this.usersService.findOne(session.user);
  }
}
