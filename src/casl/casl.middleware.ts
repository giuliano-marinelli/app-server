import { ForbiddenException } from '@nestjs/common';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

import { Action } from './casl.factory';

export const CheckPolicy: FieldMiddleware = async (midContext: MiddlewareContext, next: NextFn) => {
  const { info } = midContext;

  const { context } = midContext;

  const { source } = midContext;

  const { extensions } = info.parentType.getFields()[info.fieldName];

  const { casl } = context;

  const { user } = context.req;

  const field = info?.fieldName;
  const subject = info?.parentType?.name;
  const ability = casl.createForUser(user);

  if (!ability.can(Action.Read, info.parentType.name, info.fieldName)) {
    throw new ForbiddenException(
      `Forbidden request, you don't have permissions to read the ${field} of the ${subject}.`
    );
  }

  if (extensions?.owner) {
    const path = extensions.owner.toString().split('.');
    let sourceOwner = source;
    path.forEach((p) => {
      sourceOwner = sourceOwner[p];
    });
    if (sourceOwner != user?.id) {
      return null; // we can directly filter the not owned fields
      //   throw new ForbiddenException(
      //     `Forbidden request, you don't have permissions to read the ${field} of the ${subject} that's not of your own.`
      //   );
    }
  }

  return next();
};
