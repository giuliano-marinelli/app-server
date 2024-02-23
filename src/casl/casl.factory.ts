import { Injectable } from '@nestjs/common';

import { AbilityBuilder, createAliasResolver, createMongoAbility } from '@casl/ability';

import { Session } from 'src/sessions/entities/session.entity';
import { Role, User } from 'src/users/entities/user.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Modify = 'modify',
  Update = 'update',
  Delete = 'delete',
  Filter = 'filter'
}

@Injectable()
export class CaslFactory {
  createForUser(user: User) {
    const { can: allow, cannot: forbid, build } = new AbilityBuilder(createMongoAbility);

    const resolveAction = createAliasResolver({
      filter: ['read'], // filter action includes read action but not vice versa
      modify: ['update', 'delete']
      // manage not includes filter
    });

    // PUBLIC

    // Users
    allow(Action.Read, User.name);
    forbid(Action.Read, User.name, ['password', 'verificationCode', 'lastVerificationTry', 'sessions.token']);
    allow(Action.Filter, User.name, ['username', 'email']);
    allow(Action.Create, User.name, ['username', 'email', 'password']);

    // USER
    if (user?.role == Role.USER) {
      // Users
      // limited to logged user on service
      allow(Action.Update, User.name);
      forbid(Action.Update, User.name, [
        'role',
        'verified',
        'verificationCode',
        'lastVerificationTry',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'sessions'
      ]);
      allow(Action.Delete, User.name, ['id']);

      // Sessions
      // limited to logged user on service
      allow(Action.Read, Session.name);
      forbid(Action.Read, Session.name, ['token']);
      allow(Action.Update, Session.name, ['id']);
    }

    // ADMIN
    else if (user?.role == Role.ADMIN) {
      allow(Action.Manage, 'all');
      allow(Action.Filter, 'all');
    }

    return build({
      resolveAction
    });
  }
}
