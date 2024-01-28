import {
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { MaxLength, MinLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLObjectID, GraphQLURL } from 'graphql-scalars';
import { Schema as MongooseSchema } from 'mongoose';

import { Profile, ProfileSchema } from './profile.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

registerEnumType(Role, {
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
});

@ObjectType()
@InputType('UserInput', { isAbstract: true })
@Schema()
export class User {
  @Field(() => GraphQLObjectID)
  _id: MongooseSchema.Types.ObjectId;

  @Field()
  @MinLength(4)
  @MaxLength(30)
  @Prop({
    unique: true,
    required: true,
    minLength: 4,
    maxLength: 30
  })
  username: string;

  @Field(() => GraphQLEmailAddress)
  @MaxLength(100)
  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  })
  email: string;

  @Field()
  @MaxLength(100)
  @Prop({
    required: true
  })
  password: string;

  @Field(() => Role, { nullable: true })
  @Prop({ default: Role.USER })
  role: Role;

  @Field(() => GraphQLURL, { nullable: true })
  @Prop()
  avatar: string;

  @Field({ defaultValue: false })
  @Prop({ default: false })
  verified: boolean;

  @Field({ nullable: true })
  @Prop()
  lastVerifiedDate: Date;

  @Field({ nullable: true })
  @Prop()
  verificationCode: string;

  @Field({ defaultValue: new Date() })
  @Prop({ default: new Date() })
  createdAt: Date;

  @Field(() => Profile, { nullable: true })
  @Prop({ type: ProfileSchema, default: {} })
  profile: Profile;
}

export const UserSchema = SchemaFactory.createForClass(User);

@InputType()
export class CreateUserInput extends OmitType(
  User,
  ['_id', 'verified', 'lastVerifiedDate', 'verificationCode', 'createdAt'],
  InputType
) {}

@InputType()
export class UpdateUserInput extends IntersectionType(
  PartialType(CreateUserInput),
  PickType(User, ['_id'], InputType)
) {}
