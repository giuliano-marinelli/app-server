import { Field, InputType } from '@nestjs/graphql';

import { FilterDeviceInput } from './filter-device.input';
import { BooleanFilterInput, DateFilterInput, StringFilterInput } from 'src/search/dto/filter.input';

@InputType()
export class FilterSessionInput {
  @Field({ nullable: true })
  user: StringFilterInput;

  @Field({ nullable: true })
  token: StringFilterInput;

  @Field(() => FilterDeviceInput, { nullable: true })
  device: FilterDeviceInput;

  @Field({ nullable: true })
  blocked: BooleanFilterInput;

  @Field({ nullable: true })
  closed: BooleanFilterInput;

  @Field({ nullable: true })
  createdAt: DateFilterInput;

  @Field({ nullable: true })
  updatedAt: DateFilterInput;
}
