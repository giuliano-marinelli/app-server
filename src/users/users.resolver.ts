import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { minutes } from '@nestjs/throttler';

import {
  AuthUser,
  PaginationInput,
  SelectionInput,
  SelectionSet,
  TypeORMOrderTransform,
  TypeORMWhereTransform
} from '@nestjs!/graphql-filter';

import { GraphQLUUID } from 'graphql-scalars';
import { GraphQLUpload } from 'graphql-upload-ts';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { UploadTransform } from 'src/pipes/upload.pipe';
import { Throttle } from 'src/throttler/decorators/throttler.decorator';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { Profile } from './entities/profile.entity';
import { User, UserCreateInput, UserOrderInput, UserUpdateInput, UserWhereInput } from './entities/user.entity';

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
  @Mutation(() => User, { name: 'createUser', nullable: true })
  async create(@Args('userCreateInput') userCreateInput: UserCreateInput, @SelectionSet() selection: SelectionInput) {
    return await this.usersService.create(userCreateInput, selection);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: args.updateUserInput
  }))
  @Mutation(() => User, { name: 'updateUser', nullable: true })
  async update(
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput,
    @Args('avatarFile', { type: () => GraphQLUpload, nullable: true }, UploadTransform) avatar: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    if (avatar) {
      if (!userUpdateInput.profile) userUpdateInput.profile = new Profile();
      userUpdateInput.profile.avatar = avatar;
    }
    return await this.usersService.update(userUpdateInput, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: { password: args.password }
  }))
  @Mutation(() => User, { name: 'updateUserPassword', nullable: true })
  async updatePassword(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.updatePassword(id, password, selection, authUser);
  }

  @Throttle({
    default: {
      limit: 1,
      ttl: minutes(2),
      exceptionMessage: (info) => 'Need to wait ' + info.timeToExpire + ' seconds to send email again.'
    }
  })
  @CheckPolicies(() => ({
    action: Action.Update,
    subject: User.name
  }))
  @Mutation(() => User, { name: 'updateUserVerificationCode', nullable: true })
  async updateVerificationCode(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.updateVerificationCode(id, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Update,
    subject: User.name
  }))
  @Mutation(() => User, { name: 'verifyUser', nullable: true })
  async verify(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('code') code: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.verify(id, code, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Delete,
    subject: User.name,
    fields: { id: args.id }
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteUser' })
  async delete(@Args('id', { type: () => GraphQLUUID }) id: string, @AuthUser() authUser: User) {
    return await this.usersService.delete(id, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: User.name
  }))
  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id', { type: () => GraphQLUUID }) id: string, @SelectionSet() selection: SelectionInput) {
    return await this.usersService.findOne(id, selection);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: User.name,
    fields: args.where
  }))
  @Query(() => [User], { name: 'users', nullable: 'items' })
  async findMany(
    @Args('where', { type: () => [UserWhereInput], nullable: true }, TypeORMWhereTransform<User>)
    where: FindOptionsWhere<User>,
    @Args('order', { type: () => [UserOrderInput], nullable: true }, TypeORMOrderTransform<User>)
    order: FindOptionsOrder<User>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet() selection: SelectionInput
  ) {
    return await this.usersService.findMany(where, order, pagination, selection);
  }
}
