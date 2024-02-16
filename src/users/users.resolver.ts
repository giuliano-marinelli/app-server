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
import { GraphQLUpload } from 'graphql-upload-ts';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { UploadTransform } from 'src/pipes/upload.pipe';
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
  @Mutation(() => User, { nullable: true })
  async createUser(
    @Args('userCreateInput') userCreateInput: UserCreateInput,
    @SelectionSet() selection: SelectionInput
  ) {
    return await this.usersService.create(userCreateInput, selection);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: User.name,
    fields: args.updateUserInput
  }))
  @Mutation(() => User, { nullable: true })
  async updateUser(
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
  @Mutation(() => User, { nullable: true })
  async updatePassword(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.usersService.updatePassword(id, password, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Delete,
    subject: User.name,
    fields: { id: args.id }
  }))
  @Mutation(() => GraphQLUUID)
  async deleteUser(@Args('id', { type: () => GraphQLUUID }) id: string, @AuthUser() authUser: User) {
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
  async findAll(
    @Args('where', { type: () => [UserWhereInput], nullable: true }, TypeORMWhereTransform<User>)
    where: FindOptionsWhere<User>,
    @Args('order', { type: () => [UserOrderInput], nullable: true }, TypeORMOrderTransform<User>)
    order: FindOptionsOrder<User>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet() selection: SelectionInput
  ) {
    return await this.usersService.findAll(where, order, pagination, selection);
  }
}
