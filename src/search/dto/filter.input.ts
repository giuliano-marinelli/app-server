import { Field, InputType, PickType } from '@nestjs/graphql';

@InputType()
export class FilterInput {
  @Field({ nullable: true })
  eq: string;

  @Field({ nullable: true })
  ne: string;

  @Field({ nullable: true })
  gt: string;

  @Field({ nullable: true })
  gte: string;

  @Field({ nullable: true })
  lt: string;

  @Field({ nullable: true })
  lte: string;

  @Field({ nullable: true })
  like: string;
}

@InputType()
export class NumberFilterInput {
  @Field({ nullable: true })
  eq: number;

  @Field({ nullable: true })
  ne: number;

  @Field({ nullable: true })
  gt: number;

  @Field({ nullable: true })
  gte: number;

  @Field({ nullable: true })
  lt: number;

  @Field({ nullable: true })
  lte: number;
}

@InputType()
export class DateFilterInput {
  @Field({ nullable: true })
  eq: Date;

  @Field({ nullable: true })
  ne: Date;

  @Field({ nullable: true })
  gt: Date;

  @Field({ nullable: true })
  gte: Date;

  @Field({ nullable: true })
  lt: Date;

  @Field({ nullable: true })
  lte: Date;
}

@InputType()
export class StringFilterInput extends PickType(FilterInput, ['eq', 'ne', 'like'] as const) {}

@InputType()
export class BooleanFilterInput {
  @Field({ nullable: true })
  eq: boolean;

  @Field({ nullable: true })
  ne: boolean;
}
