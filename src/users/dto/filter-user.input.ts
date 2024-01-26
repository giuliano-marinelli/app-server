import { Field, InputType } from '@nestjs/graphql';

import { FilterProfileInput } from './filter-profile.input';
import { BooleanFilterInput, DateFilterInput, StringFilterInput } from 'src/search/dto/filter.input';

@InputType()
export class FilterUserInput {
  @Field({ nullable: true })
  username: StringFilterInput;

  @Field({ nullable: true })
  email: StringFilterInput;

  @Field({ nullable: true })
  role: StringFilterInput;

  @Field({ nullable: true })
  verified: BooleanFilterInput;

  @Field({ nullable: true })
  lastVerifiedDate: DateFilterInput;

  @Field({ nullable: true })
  verificationCode: StringFilterInput;

  @Field({ nullable: true })
  createdAt: DateFilterInput;

  @Field(() => FilterProfileInput, { nullable: true })
  profile: FilterProfileInput;
}
