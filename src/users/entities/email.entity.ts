import { Field } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType } from '@nestjs!/graphql-filter';

import { IsEmail, MaxLength } from 'class-validator';
import { GraphQLEmailAddress } from 'graphql-scalars';
import { Column } from 'typeorm';

export class Email {
  @Field(() => GraphQLEmailAddress)
  @FilterField()
  @Column() // lowercase: true, trim: true
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ default: false })
  verified: boolean;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  verificationCode: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  lastVerificationTry: Date;
}

@FilterWhereType(Email)
export class EmailWhereInput {}

@FilterOrderType(Email)
export class EmailOrderInput {}
