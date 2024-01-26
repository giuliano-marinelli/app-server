import { Field, InputType } from '@nestjs/graphql';

import { StringFilterInput } from 'src/search/dto/filter.input';

@InputType()
export class FilterProfileInput {
  @Field({ nullable: true })
  name: StringFilterInput;

  @Field({ nullable: true })
  bio: StringFilterInput;

  @Field({ nullable: true })
  location: StringFilterInput;

  @Field({ nullable: true })
  url: StringFilterInput;
}
