import {
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql';

import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLUUID } from 'graphql-scalars';
import { FilterField, FilterOrderType, FilterWhereType } from 'src/common/search/search';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

import { Profile, ProfileFilterInput } from './profile.entity';
import { Session } from 'src/sessions/entities/session.entity';

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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @FilterField()
  @Column()
  @Unique(['username'])
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @Field(() => GraphQLEmailAddress)
  @FilterField()
  @Column() // lowercase: true, trim: true
  @Unique(['email'])
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Field()
  @Column()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Field(() => Role, { nullable: true })
  @FilterField()
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Field(() => Profile, { nullable: true })
  @FilterField(() => ProfileFilterInput)
  @Column(() => Profile)
  profile: Profile;

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

  @Field()
  @FilterField()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @FilterField()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => [Session], { nullable: true })
  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];
}

@InputType()
export class CreateUserInput extends OmitType(
  User,
  ['id', 'createdAt', 'updatedAt', 'deletedAt', 'sessions'],
  InputType
) {}

@InputType()
export class UpdateUserInput extends IntersectionType(
  PartialType(CreateUserInput),
  PickType(User, ['id'], InputType)
) {}

@FilterWhereType(User)
export class UserWhereInput {}

@FilterOrderType(User)
export class UserOrderInput {}
