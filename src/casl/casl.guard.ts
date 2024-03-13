import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject as CaslSubject } from '@casl/ability';

import { Action, CaslFactory } from './casl.factory';
import { CHECK_POLICIES_KEY, Policy } from './decorators/check-policies.decorator';

import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslFactory,
    private sharedService: SharedService
  ) {}

  async canActivate(execContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(execContext);

    const policyHandlers = this.reflector.get<Policy[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    if (!policyHandlers?.length) {
      return true;
    }

    const { casl } = context.getContext();

    const { user } = context.getContext().req;

    const ability = casl.createForUser(user);

    const args = context.getArgs();

    // check if user has permission to do the action of each policy
    policyHandlers.forEach((policy) => {
      // get the policy action, subject and fields
      const { action, subject, fields } = policy(args);

      // if action is Filter the permission check is over filter kind fields
      if (action == Action.Filter) {
        // get the filter fields as an array of string
        // sub filter fields are showed as parent.child
        const filterFields = this.sharedService.formatFilterFields(fields);

        // check if user has permission to do the filtering with the filter fields
        filterFields.forEach((filterField) => {
          if (!ability.can(Action.Filter, CaslSubject(subject, fields), filterField)) {
            throw new ForbiddenException(
              `Forbidden request, you don't have permissions to filter over ${filterField} of the ${subject}.`
            );
          }
        });
      } else {
        const plainFields = this.sharedService.formatFields(fields);

        // check if user has permission to do the action on the subject
        if (!ability.can(action, plainFields ? CaslSubject(subject, plainFields) : subject)) {
          throw new ForbiddenException(`Forbidden request, you don't have permissions to ${action} the ${subject}.`);
        }

        // check if user has permission to do the action on the subject fields
        Object.keys(plainFields)?.forEach((field) => {
          if (field != 'id' && !ability.can(action, subject, field)) {
            throw new ForbiddenException(
              `Forbidden request, you don't have permissions to ${action} the ${field} of the ${subject}.`
            );
          }
        });
      }
    });

    return true;
  }
}
