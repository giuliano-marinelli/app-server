import { Field, InputType, PartialType } from '@nestjs/graphql';

import { Schema as MongooseSchema } from 'mongoose';

import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
}
