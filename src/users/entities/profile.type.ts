import { Field as GraphQLField, InputType as GraphQLInput, ObjectType as GraphQLObject } from '@nestjs/graphql';

import { Nullable, Field as PrismaField, Type as PrismaType, String } from '@nestjs!/prisma';

@GraphQLObject()
@GraphQLInput('ProfileInput')
@PrismaType()
export class Profile {
  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  name: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  bio: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  location: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  url: string;
}
