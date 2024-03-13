import {
  Extensions,
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Profile, ProfileOrderInput, ProfileWhereInput } from './profile.entity';
import { Email, EmailOrderInput, EmailWhereInput } from 'src/emails/entities/email.entity';
import { Session, SessionOrderInput, SessionWhereInput } from 'src/sessions/entities/session.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Defines wich permissions user has.',
  valuesMap: {
    USER: {
      description: 'User role can access to application basic features.'
    },
    ADMIN: {
      description: 'Admin role can access to all application features.'
    }
  }
});

@ObjectType()
@InputType('UserInput', { isAbstract: true })
@Entity()
export class User {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @FilterField()
  @Column()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @Field({ middleware: [CheckPolicy] })
  @Column()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Field(() => Role, { nullable: true })
  @FilterField()
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Field(() => Email, { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => EmailWhereInput, () => EmailOrderInput)
  @OneToOne(() => Email, (email) => email.user, { cascade: true })
  @JoinColumn({ referencedColumnName: 'id' })
  @Extensions({ owner: 'id' })
  primaryEmail: Email;

  @Field(() => Profile, { nullable: true })
  @FilterField(() => ProfileWhereInput, () => ProfileOrderInput)
  @Column(() => Profile)
  profile: Profile;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  verificationCode: string;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  lastVerificationTry: Date;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  passwordCode: string;

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

  @Field(() => [Email], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => EmailWhereInput, () => EmailOrderInput)
  @OneToMany(() => Email, (email) => email.user, { cascade: true })
  @Extensions({ owner: 'id' })
  emails: Email[];

  @Field(() => [Session], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => SessionWhereInput, () => SessionOrderInput)
  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  @Extensions({ owner: 'id' })
  sessions: Session[];
}

@InputType()
export class UserCreateInput extends PickType(User, ['username', 'password', 'role', 'profile'], InputType) {
  @Field(() => GraphQLEmailAddress)
  @IsEmail()
  @MaxLength(100)
  email: string;
}

@InputType()
export class UserUpdateInput extends IntersectionType(
  PickType(User, ['id'], InputType),
  PartialType(OmitType(UserCreateInput, ['password', 'email']))
) {}

@InputType()
export class UserRefInput extends PickType(User, ['id'], InputType) {}

@FilterWhereType(User)
export class UserWhereInput {}

@FilterOrderType(User)
export class UserOrderInput {}

@Many(User, { setName: 'set' })
export class Users {}
