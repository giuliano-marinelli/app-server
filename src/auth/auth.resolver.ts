import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthUser, SelectionInput, SelectionSet } from '@nestjs!/graphql-filter';

import { GraphQLUUID } from 'graphql-scalars';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';

import { Public } from './decorators/public.decorator';

import { User } from 'src/users/entities/user.entity';

import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Query(() => String, {
    name: 'login',
    description: 'Login with username or email and password. Returns the token string.'
  })
  async login(
    @Args('usernameOrEmail') usernameOrEmail: string,
    @Args('password') password: string,
    @Context() context: any
  ) {
    return await this.authService.login(usernameOrEmail, password, context);
  }

  @Query(() => Boolean, {
    name: 'logout',
    description: 'Logout the current user. Close current session of device.'
  })
  async logout(@Context() context: any) {
    return await this.authService.logout(context);
  }

  @Public()
  @Mutation(() => User, { name: 'resetUserPassword', nullable: true })
  async resetPassword(
    @Args('code') code: string,
    @Args('newPassword') newPassword: string,
    @SelectionSet() selection: SelectionInput
  ) {
    return await this.authService.resetPassword(code, newPassword, selection);
  }

  //   @Throttle({
  //     default: {
  //       limit: 1,
  //       ttl: minutes(1),
  //       exceptionMessage: (info) => 'Need to wait ' + info.timeToExpire + ' seconds to send email again.'
  //     }
  //   })
  @Public()
  @Mutation(() => User, { name: 'updateUserPasswordCode', nullable: true })
  async updatePasswordCode(
    @Args('usernameOrEmail') usernameOrEmail: string,
    @SelectionSet() selection: SelectionInput
  ) {
    return await this.authService.updatePasswordCode(usernameOrEmail, selection);
  }

  //   @Throttle({
  //     default: {
  //       limit: 1,
  //       ttl: minutes(2),
  //       exceptionMessage: (info) => 'Need to wait ' + info.timeToExpire + ' seconds to send email again.'
  //     }
  //   })
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
    return await this.authService.updateVerificationCode(id, selection, authUser);
  }

  //   @Throttle({
  //     default: {
  //       limit: 1,
  //       ttl: seconds(10),
  //       exceptionMessage: (info) => 'Need to wait ' + info.timeToExpire + ' seconds to check verification code again.'
  //     }
  //   })
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: User.name
  }))
  @Query(() => Boolean, { name: 'checkUserVerificationCode', nullable: true })
  async checkVerificationCode(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('code') code: string,
    @AuthUser() authUser: User
  ) {
    return await this.authService.checkVerificationCode(id, code, authUser);
  }
}
