import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { IsEmail, MaxLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { User, UserOrderInput, UserRefInput, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('EmailInput', { isAbstract: true })
@Entity()
export class Email {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => GraphQLEmailAddress)
  @FilterField()
  @Column() // lowercase: true, trim: true
  @IsEmail()
  @MaxLength(100)
  address: string;

  @Field(() => User, { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToOne(() => User, (user) => user.emails)
  user: User;

  @Field({ nullable: true })
  @FilterField()
  @Column({ default: false })
  verified: boolean;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  verificationCode: string;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  lastVerificationTry: Date;

  @Field({ nullable: true })
  @FilterField()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @DeleteDateColumn()
  deletedAt: Date;
}

@InputType()
export class EmailCreateInput extends PickType(Email, ['address'], InputType) {
  @Field(() => UserRefInput)
  user: UserRefInput;
}

@InputType()
export class EmailRefInput extends PickType(Email, ['id'], InputType) {}

@FilterWhereType(Email)
export class EmailWhereInput {}

@FilterOrderType(Email)
export class EmailOrderInput {}

@Many(Email, { setName: 'set' })
export class Emails {}
