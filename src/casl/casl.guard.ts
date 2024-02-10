import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject as CaslSubject } from '@casl/ability';

import { Action, CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_POLICIES_KEY, Policy } from './decorators/casl.decorator';

import { SharedService } from 'src/common/shared/shared.service';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private sharedService: SharedService
  ) {}

  async canActivate(execContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(execContext);

    const policyHandlers = this.reflector.get<Policy[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    if (!policyHandlers?.length) {
      return true;
    }

    const { user } = context.getContext().req;

    const ability = this.caslAbilityFactory.createForUser(user);

    const args = context.getArgs();

    const info = context.getInfo();

    // console.log('args', args);

    // get the selections set as a array of string
    // sub selections set are showed as parent.child
    // example: user { name, email, sessions { _id, ip } }
    // selectionsSet = ['name', 'email', 'sessions._id', 'sessions.ip']
    const selectionsSet = this.sharedService.getQuerySelectionsSetAsString(
      info.fieldNodes[0]?.selectionSet?.selections
    );

    // check if user has permission to do the action of each policy
    policyHandlers.forEach((policy) => {
      // get the policy action, subject and fields
      const { action, subject, fields } = policy(args, selectionsSet);

      //   console.log({ action, subject, fields });

      //   console.log('selectionsSet', selectionsSet);

      // always check if user has permission to read the selections set that is asking for
      // we have to do it here because we need to know the subject wich comes in the policy
      selectionsSet.forEach((selection) => {
        if (!ability.can(Action.Read, subject, selection)) {
          throw new ForbiddenException(
            `Forbidden request, you don't have permissions to read the ${selection} of the ${subject}.`
          );
        }
      });

      // if action is Filter the permission check is over filter kind fields
      if (action == Action.Filter) {
        // get the filter fields as an array of string
        // sub filter fields are showed as parent.child
        const filterFields = this.sharedService.getFilterFieldsAsString(fields);

        // console.log('fields', fields);
        console.log('filterFields', filterFields);

        // check if user has permission to do the filtering with the filter fields
        filterFields.forEach((filterField) => {
          if (!ability.can(Action.Filter, CaslSubject(subject, fields), filterField)) {
            throw new ForbiddenException(
              `Forbidden request, you don't have permissions to filter over ${filterField} of the ${subject}.`
            );
          }
        });
      } else {
        const plainFields = this.sharedService.getOneLevelFields(fields);

        // check if user has permission to do the action on the subject
        if (!ability.can(action, plainFields ? CaslSubject(subject, plainFields) : subject)) {
          throw new ForbiddenException(`Forbidden request, you don't have permissions to ${action} the ${subject}.`);
        }

        // check if user has permission to do the action on the subject fields
        Object.keys(plainFields)?.forEach((field) => {
          if (field != '_id' && !ability.can(action, subject, field)) {
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
