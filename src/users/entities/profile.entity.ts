import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType } from '@nestjs!/graphql-filter';

import { IsUrl } from 'class-validator';
import { Column, ManyToOne } from 'typeorm';

import { Email } from 'src/emails/entities/email.entity';

@ObjectType()
@InputType('ProfileInput')
export class Profile {
  @Field({ nullable: true })
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
  @IsUrl()
  @Column({ nullable: true })
  url: string;

  @Field(() => Email, { nullable: true })
  @FilterField()
  @ManyToOne(() => Email)
  publicEmail: Email;
}

@FilterWhereType(Profile)
export class ProfileWhereInput {}

@FilterOrderType(Profile)
export class ProfileOrderInput {}
