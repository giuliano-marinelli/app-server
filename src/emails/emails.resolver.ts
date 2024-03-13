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
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { Throttle } from 'src/throttler/decorators/throttler.decorator';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { Email, EmailCreateInput, EmailOrderInput, EmailWhereInput, Emails } from './entities/email.entity';
import { User } from 'src/users/entities/user.entity';

import { EmailsService } from './emails.service';

@Resolver(() => Email)
export class EmailsResolver {
  constructor(private readonly emailsService: EmailsService) {}

  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: Email.name,
    fields: args.emailCreateInput
  }))
  @Mutation(() => Email, { name: 'createEmail', nullable: true })
  async create(
    @Args('emailCreateInput') emailCreateInput: EmailCreateInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.create(emailCreateInput, selection, authUser);
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
    subject: Email.name
  }))
  @Mutation(() => Email, { name: 'updateEmailVerificationCode', nullable: true })
  async updateVerificationCode(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.updateVerificationCode(id, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Update,
    subject: Email.name
  }))
  @Mutation(() => Email, { name: 'verifyEmail', nullable: true })
  async verify(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('code') code: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.verify(id, code, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Delete,
    subject: Email.name
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteEmail' })
  async delete(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @Args('code') code: string,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.delete(id, password, code, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Email.name
  }))
  @Query(() => Boolean, { name: 'checkEmailAddressExists', nullable: true })
  async checkAddressExists(@Args('address') address: string) {
    return await this.emailsService.checkAddressExists(address);
  }

  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Email.name
  }))
  @Query(() => Email, { name: 'email', nullable: true })
  async findOne(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.findOne(id, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: Email.name,
    fields: args.where
  }))
  @Query(() => Emails, { name: 'emails' })
  async findMany(
    @Args('where', { type: () => [EmailWhereInput], nullable: true }, TypeORMWhereTransform<Email>)
    where: FindOptionsWhere<Email>,
    @Args('order', { type: () => [EmailOrderInput], nullable: true }, TypeORMOrderTransform<Email>)
    order: FindOptionsOrder<Email>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.emailsService.findMany(where, order, pagination, selection, authUser);
  }
}
