import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { GraphQLURL } from 'graphql-scalars';
import { FilterField, FilterWhereType } from 'src/common/search/search';
import { Column } from 'typeorm';

@ObjectType()
@InputType('ProfileInput', { isAbstract: true })
export class Profile {
  @Field(() => GraphQLURL, { nullable: true })
  @FilterField()
  @Column({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  location: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  url: string;
}

@FilterWhereType(Profile)
export class ProfileFilterInput {}
