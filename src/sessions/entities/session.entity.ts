import { Field as GraphQLField, InputType as GraphQLInput, ObjectType as GraphQLObject } from '@nestjs/graphql';

import {
  Boolean,
  DateTime,
  Mongo as Db,
  Default,
  Fields,
  Id,
  ManyToOne,
  Map,
  Nullable,
  Field as PrismaField,
  Model as PrismaModel,
  Relation as PrismaRelation,
  References,
  String,
  Unique
} from '@nestjs!/prisma';

import { GraphQLObjectID } from 'graphql-scalars';

import { Device } from './device.type';

import { User } from 'src/users/entities/user.entity';

@GraphQLObject()
@GraphQLInput('SessionInput', { isAbstract: true })
@PrismaModel()
export class Session {
  @GraphQLField(() => GraphQLObjectID)
  @PrismaField(String(Id, Default('auto()'), Map('_id'), Db.ObjectId), { name: 'id' })
  id: string;

  @GraphQLField(() => User)
  @PrismaField(String(Db.ObjectId), { name: 'userId' })
  @PrismaRelation(User, (R) => ManyToOne(R, Fields('userId'), References('id')), { name: 'user' })
  user: string;

  @GraphQLField()
  @PrismaField(String(Unique))
  token: string;

  @GraphQLField(() => Device, { nullable: true })
  @PrismaField(Device, (T) => T(Nullable, Default({})))
  device: Device;

  @GraphQLField()
  @PrismaField(Boolean(Default(false)))
  blocked: boolean;

  @GraphQLField()
  @PrismaField(Boolean(Default(false)))
  closed: boolean;

  @GraphQLField()
  @PrismaField(DateTime(Default('now()')))
  createdAt: Date;

  @GraphQLField()
  @PrismaField(DateTime(Default('now()')))
  updatedAt: Date;
}
