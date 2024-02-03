import { Field as GraphQLField, InputType as GraphQLInput, ObjectType as GraphQLObject } from '@nestjs/graphql';

import { Nullable, Field as PrismaField, Type as PrismaType, String } from '@nestjs!/prisma';

@GraphQLObject()
@GraphQLInput('DeviceInput')
@PrismaType()
export class Device {
  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  client: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  os: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  brand: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  model: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  type: string;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  bot: boolean;

  @GraphQLField({ nullable: true })
  @PrismaField(String(Nullable))
  ip: string;
}
