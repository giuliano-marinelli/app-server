import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortInput {
  @Field()
  by: string;

  @Field()
  direction: string;
}
