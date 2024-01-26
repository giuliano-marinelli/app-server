import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { Schema as MongooseSchema } from 'mongoose';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/casl.decorator';

import { User } from './entities/user.entity';
import { Session } from 'src/sessions/entities/session.entity';

import { CreateUserInput } from './dto/create-user.input';
import { FilterUserInput } from './dto/filter-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginationInput } from 'src/search/dto/pagination.input';
import { SortInput } from 'src/search/dto/sort.input';

import { UsersService } from './users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService
  ) {}

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: User.name,
    fields: args.createUserInput
  }))
  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.usersService.create(createUserInput);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: User.name,
    fields: args.filter
  }))
  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args('search', { nullable: true }) search: string,
    @Args('filter', { nullable: true }) filter: FilterUserInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort: SortInput[],
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @Args('optional', { defaultValue: false }) optional: boolean
  ) {
    return await this.usersService.findAll({ search, filter, sort, pagination, optional });
  }

  @Public()
  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => String }) id: MongooseSchema.Types.ObjectId) {
    return await this.usersService.findOne(id);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: args.updateUserInput
  }))
  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return await this.usersService.update(updateUserInput._id, updateUserInput);
  }

  @CheckPolicies((args) => ({
    action: Action.Delete,
    subject: User.name,
    fields: { _id: args.id }
  }))
  @Mutation(() => User)
  async deleteUser(@Args('id', { type: () => ID }) id: MongooseSchema.Types.ObjectId) {
    return await this.usersService.remove(id);
  }

  //   @ResolveField(() => [Session])
  //   async sessions(@Parent() user: User) {
  //     return this.sessionsService.findAll({ userId: user.id });
  //   }
}
