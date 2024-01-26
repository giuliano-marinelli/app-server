import { Field, InputType } from '@nestjs/graphql';

import { MaxLength, MinLength } from 'class-validator';

import { Role } from '../entities/user.entity';

import { ProfileInput } from './profile.input';

@InputType()
export class CreateUserInput {
  @Field()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @Field()
  @MaxLength(100)
  email: string;

  @Field()
  @MaxLength(100)
  password: string;

  @Field(() => Role, { nullable: true })
  role: Role;

  @Field({ nullable: true })
  avatar: string;

  @Field(() => ProfileInput, { nullable: true })
  profile: ProfileInput;
}
