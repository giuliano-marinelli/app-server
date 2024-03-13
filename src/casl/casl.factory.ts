import { Injectable } from '@nestjs/common';

import { AbilityBuilder, createAliasResolver, createMongoAbility } from '@casl/ability';

import { Email } from 'src/emails/entities/email.entity';
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
    allow(Action.Create, User.name, ['username', 'email', 'password']);
    allow(Action.Read, User.name);
    forbid(Action.Read, User.name, ['password', 'verificationCode', 'lastVerificationTry']);
    allow(Action.Filter, User.name, ['username', 'emails.address']);

    // Emails
    allow(Action.Read, Email.name);
    forbid(Action.Read, Email.name, ['user.**', 'verificationCode', 'lastVerificationTry']);
    allow(Action.Filter, Email.name, ['address', 'verified']);

    // USER
    if (user?.role == Role.USER) {
      // Users
      // limited to owner user on service
      allow(Action.Update, User.name, ['id', 'username', 'profile.**']);
      allow(Action.Delete, User.name);

      // Emails
      // limited to owner user on service
      allow(Action.Create, Email.name, ['address', 'user.id']);
      allow(Action.Update, Email.name);
      allow(Action.Delete, Email.name);

      // Sessions
      // limited to owner user on service
      allow(Action.Update, Session.name);
      allow(Action.Read, Session.name);
      allow(Action.Filter, Session.name, ['id', 'user.id']);
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
