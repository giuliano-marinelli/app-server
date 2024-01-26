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
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    const resolveAction = createAliasResolver({
      filter: ['read'], // filter action includes read action but not vice versa
      modify: ['update', 'delete']
    });

    if (!user) {
      // not logged user can read user fields
      can(Action.Read, User.name);
      // not logged user can't read these user fields
      cannot(Action.Read, User.name, ['role', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt']);
      // it's used for check if a username or email is already in use
      can(Action.Filter, User.name, ['username', 'email']);
      // not logged user can create a new user
      can(Action.Create, User.name);
      // not logged user can't create a new user with these fields
      cannot(Action.Create, User.name, ['role', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt']);
    } else {
      if (user.role == Role.ADMIN) {
        // admin can read-write everything
        can(Action.Manage, 'all');
        // admin can filter everything
        can(Action.Filter, 'all');
      } else {
        // logged user can read user fields
        can(Action.Read, User.name);
        // logged user can't read these user fields
        cannot(Action.Read, User.name, ['lastVerifiedDate', 'verificationCode']);
        // logged user can update or delete only his own user
        can(Action.Update, User.name, { _id: user._id });
        can(Action.Delete, User.name, { _id: user._id });
        // logged user can't modify these fields
        cannot(Action.Modify, User.name, ['role', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt']);
      }
    }

    return build({
      resolveAction
    });
  }
}
