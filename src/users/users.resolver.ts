import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GraphQLUUID } from 'graphql-scalars';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/casl.decorator';
import { TypeORMOrderTransform, TypeORMWhereTransform } from 'src/common/search/search';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { CreateUserInput, UpdateUserInput, User, UserOrderInput, UserWhereInput } from './entities/user.entity';

import { PaginationInput } from 'src/common/search/pagination.input';

import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: User.name,
    fields: args.createUserInput
  }))
  @Mutation(() => User, { nullable: true })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.usersService.create(createUserInput);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: args.updateUserInput
  }))
  @Mutation(() => User, { nullable: true })
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return await this.usersService.update(updateUserInput);
  }

  @CheckPolicies((args) => ({
    action: Action.Delete,
    subject: User.name,
    fields: { id: args.id }
  }))
  @Mutation(() => GraphQLUUID)
  async deleteUser(@Args('id', { type: () => GraphQLUUID }) id: string) {
    return await this.usersService.delete(id);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: User.name
  }))
  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id', { type: () => GraphQLUUID }) id: string) {
    return await this.usersService.findOne(id);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: User.name,
    fields: args.where
  }))
  @Query(() => [User], { name: 'users', nullable: 'items' })
  async findAll(
    @Args('where', { type: () => [UserWhereInput], nullable: true }, TypeORMWhereTransform<User>)
    where: FindOptionsWhere<User>,
    @Args('order', { type: () => [UserOrderInput], nullable: true }, TypeORMOrderTransform<User>)
    order: FindOptionsOrder<User>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput
  ) {
    return await this.usersService.findAll({ where, order, pagination });
  }
}
