import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType } from '@nestjs!/graphql-filter';

import { IsUrl, MaxLength } from 'class-validator';
import { Column, JoinColumn, OneToOne } from 'typeorm';

import { Email, EmailOrderInput, EmailWhereInput } from 'src/emails/entities/email.entity';

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
  @MaxLength(30)
  name: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  @MaxLength(200)
  bio: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  @MaxLength(100)
  location: string;

  @Field({ nullable: true })
  @FilterField()
  @IsUrl()
  @Column({ nullable: true })
  @MaxLength(200)
  url: string;

  @Field(() => Email, { nullable: true })
  @FilterField(() => EmailWhereInput, () => EmailOrderInput)
  @OneToOne(() => Email)
  @JoinColumn({ referencedColumnName: 'id' })
  publicEmail: Email;
}

@FilterWhereType(Profile)
export class ProfileWhereInput {}

@FilterOrderType(Profile)
export class ProfileOrderInput {}
