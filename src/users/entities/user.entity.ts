import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { MaxLength, MinLength } from 'class-validator';
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
@Schema()
export class User {
  @Field(() => ID)
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

  @Field()
  @MaxLength(100)
  @Prop({
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  })
  email: string;

  //@Field()
  //@MaxLength(100)
  @Prop({
    required: true
  })
  password: string;

  @Field(() => Role, { defaultValue: Role.USER })
  @Prop({ default: Role.USER })
  role: Role;

  @Field({ nullable: true })
  @Prop()
  avatar: string;

  @Field({ defaultValue: false })
  @Prop({ default: false })
  verified: boolean;

  //   @Field({ nullable: true })
  @Prop()
  lastVerifiedDate: Date;

  //   @Field({ nullable: true })
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
