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
export class CaslAbilityFactory {
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
    forbid(Action.Read, User.name, ['password', 'verificationCode', 'lastVerificationTry', 'sessions']);
    allow(Action.Filter, User.name, ['username', 'email']);
    // allow(Action.Filter, User.name);
    allow(Action.Create, User.name, ['username', 'email', 'password']);

    console.log('logged user', user?.id.toString());

    // USER
    if (user?.role == Role.USER) {
      // Users
      allow(Action.Modify, User.name, { id: user.id });
      forbid(Action.Modify, User.name, [
        'role',
        'verified',
        'verificationCode',
        'lastVerificationTry',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'sessions'
      ]);

      // Sessions
      allow(Action.Read, Session.name);
      forbid(Action.Read, Session.name, ['token']);
      allow(Action.Filter, Session.name, ['user.username', 'device.client', 'createdAt', 'updatedAt', 'deletedAt']);
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
