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
      // manage not includes filter
    });

    // PUBLIC

    // Users
    // '_id', 'username', 'email', 'role', 'avatar', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt', 'profile.name', 'profile.bio', 'profile.location', 'profile.url'
    can(Action.Read, User.name, [
      '_id',
      'username',
      'email',
      'role',
      'avatar',
      'verified',
      'createdAt',
      'profile.name',
      'profile.bio',
      'profile.location',
      'profile.url'
    ]);
    can(Action.Filter, User.name, ['username', 'email']);
    can(Action.Create, User.name, [
      'username',
      'email',
      'password',
      'profile.name',
      'profile.bio',
      'profile.location',
      'profile.url'
    ]);

    console.log('user', user?._id.toString());

    // USER
    if (user?.role == Role.USER) {
      // Users
      // '_id', 'username', 'email', 'role', 'avatar', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt', 'profile.name', 'profile.bio', 'profile.location', 'profile.url'

      can(
        Action.Modify,
        User.name,
        ['username', 'email', 'avatar', 'profile.name', 'profile.bio', 'profile.location', 'profile.url'],
        { _id: user._id }
      );

      // Sessions
      // '_id', 'user', 'token', 'blocked' ,'closed', 'createdAt', 'updatedAt', 'device.client', 'device.os', 'device.brand', 'device.model', 'device.type', 'device.bot', 'device.ip'

      can(Action.Read, Session.name, [
        '_id',
        'token',
        'blocked',
        'closed',
        'createdAt',
        'updatedAt',
        'device.client',
        'device.os',
        'device.brand',
        'device.model',
        'device.type',
        'device.bot',
        'device.ip',
        'user._id'
      ]);

      console.log('user filter', { eq: user._id.toString() });

      can(Action.Filter, Session.name, ['user'], { user: { eq: user._id.toString() } }); // casl can't compare json objects, this is a limitation that we have to deal with Prisma
    }

    // ADMIN
    else if (user?.role == Role.ADMIN) {
      can(Action.Manage, 'all');
      can(Action.Filter, 'all');
    }

    return build({
      resolveAction
    });
  }
}
