import {
  Field as GraphQLField,
  InputType as GraphQLInput,
  ObjectType as GraphQLObject,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType as registerGraphQLEnum
} from '@nestjs/graphql';

import {
  Boolean,
  DateTime,
  Mongo as Db,
  Default,
  Id,
  Map,
  Nullable,
  OneToMany,
  Field as PrismaField,
  Model as PrismaModel,
  Relation as PrismaRelation,
  String,
  Unique,
  registerEnum as registerPrismaEnum
} from '@nestjs!/prisma';

import { IsLowercase, MaxLength, MinLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLObjectID, GraphQLURL } from 'graphql-scalars';

import { Profile } from './profile.type';

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

const RoleOptions = {
  name: 'Role',
  description: 'Defines wich permissions user has.',
  valuesMap: {
    USER: {
      description: 'User role can access to application basic features.'
    },
    ADMIN: {
      description: 'Admin role can access to all application features.'
    }
  }
};

registerGraphQLEnum(Role, RoleOptions);

registerPrismaEnum(Role, RoleOptions);

@GraphQLObject()
@GraphQLInput('UserInput', { isAbstract: true })
@PrismaModel()
export class User {
  @GraphQLField(() => GraphQLObjectID)
  @PrismaField(String(Id, Default('auto()'), Map('_id'), Db.ObjectId), { name: 'id' })
  id: string;

  @GraphQLField()
  @PrismaField(String(Unique))
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @GraphQLField(() => GraphQLEmailAddress)
  @PrismaField(String(Unique))
  @MaxLength(100)
  @IsLowercase()
  email: string;

  @GraphQLField()
  @PrismaField()
  @MaxLength(100)
  password: string;

  @GraphQLField(() => Role, { nullable: true })
  @PrismaField(Role, (T) => T(Default('USER')))
  role: Role;

  @GraphQLField(() => GraphQLURL, { nullable: true })
  @PrismaField()
  avatar: string;

  @GraphQLField({ defaultValue: false })
  @PrismaField(Boolean(Default(false)))
  verified: boolean;

  @GraphQLField({ nullable: true })
  @PrismaField(DateTime(Nullable))
  lastVerifiedDate: Date;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  verificationCode: string;

  @GraphQLField({ defaultValue: new Date() })
  @PrismaField(DateTime(Default('now()')))
  createdAt: Date;

  @GraphQLField(() => Profile, { nullable: true })
  @PrismaField(Profile, (T) => T(Nullable, Default({})))
  profile: Profile;

  @PrismaRelation('Session', (R) => OneToMany(R))
  sessions: [];
}

@GraphQLInput()
export class CreateUserInput extends OmitType(
  User,
  ['id', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt'],
  GraphQLInput
) {}

@GraphQLInput()
export class UpdateUserInput extends IntersectionType(
  PartialType(CreateUserInput),
  PickType(User, ['id'], GraphQLInput)
) {}
