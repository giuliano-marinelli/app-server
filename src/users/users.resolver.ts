import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { minutes, seconds } from '@nestjs/throttler';

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
import { User, UserCreateInput, UserOrderInput, UserUpdateInput, UserWhereInput, Users } from './entities/user.entity';
import { EmailRefInput } from 'src/emails/entities/email.entity';

import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: User.name,
    fields: args.userCreateInput
  }))
  @Mutation(() => User, { name: 'createUser', nullable: true })
  async create(@Args('userCreateInput') userCreateInput: UserCreateInput, @SelectionSet() selection: SelectionInput) {
    console.log('userCreateInput', userCreateInput);

    return await this.usersService.create(userCreateInput, selection);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: args.userUpdateInput
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

  @CheckPolicies(() => ({
    action: Action.Update,
    subject: User.name
  }))
  @Mutation(() => User, { name: 'updateUserPassword', nullable: true })
  async updatePassword(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @Args('newPassword') newPassword: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.updatePassword(id, password, newPassword, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Update,
    subject: User.name
  }))
  @Mutation(() => User, { name: 'updateUserPrimaryEmail', nullable: true })
  async updatePrimaryEmail(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @Args('code') code: string,
    @Args('email', { type: () => EmailRefInput }) email: EmailRefInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.updatePrimaryEmail(id, password, code, email, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Delete,
    subject: User.name
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteUser' })
  async delete(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.delete(id, password, authUser);
  }

  //   @Throttle({
  //     default: {
  //       limit: 1,
  //       ttl: seconds(10),
  //       exceptionMessage: (info) => 'Need to wait ' + info.timeToExpire + ' seconds to check password again.'
  //     }
  //   })
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: User.name
  }))
  @Query(() => Boolean, { name: 'checkUserPassword', nullable: true })
  async checkPassword(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.checkPassword(id, password, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: User.name
  }))
  @Query(() => Boolean, { name: 'checkUserUsernameExists', nullable: true })
  async checkUsernameExists(@Args('username') username: string) {
    return await this.usersService.checkUsernameExists(username);
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
  @Query(() => Users, { name: 'users' })
  async findMany(
    @Args('where', { type: () => [UserWhereInput], nullable: true }, TypeORMWhereTransform<User>)
    where: FindOptionsWhere<User>,
    @Args('order', { type: () => [UserOrderInput], nullable: true }, TypeORMOrderTransform<User>)
    order: FindOptionsOrder<User>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput
  ) {
    return await this.usersService.findMany(where, order, pagination, selection);
  }
}
