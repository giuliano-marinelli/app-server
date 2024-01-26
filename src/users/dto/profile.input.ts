import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProfileInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  location: string;

  @Field({ nullable: true })
  url: string;
}
