import { Field, InputType } from '@nestjs/graphql';

import { BooleanFilterInput, StringFilterInput } from 'src/search/dto/filter.input';

@InputType()
export class FilterDeviceInput {
  @Field({ nullable: true })
  client: StringFilterInput;

  @Field({ nullable: true })
  os: StringFilterInput;

  @Field({ nullable: true })
  brand: StringFilterInput;

  @Field({ nullable: true })
  model: StringFilterInput;

  @Field({ nullable: true })
  type: StringFilterInput;

  @Field({ nullable: true })
  bot: BooleanFilterInput;

  @Field({ nullable: true })
  ip: StringFilterInput;
}
