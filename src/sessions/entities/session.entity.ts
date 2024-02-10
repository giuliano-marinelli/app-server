import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';

import { GraphQLUUID } from 'graphql-scalars';
import { FilterField, FilterOrderType, FilterWhereType } from 'src/common/search/search';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Device, DeviceFilterInput } from './device.entity';
import { User, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('SessionInput', { isAbstract: true })
@Entity()
export class Session {
  @Field(() => GraphQLUUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User, { nullable: true })
  @FilterField(() => UserWhereInput)
  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  @Field()
  @FilterField()
  @Column()
  token: string;

  @Field(() => Device, { nullable: true })
  @FilterField(() => DeviceFilterInput)
  @Column(() => Device)
  device: Device;

  @Field({ defaultValue: new Date() })
  @FilterField()
  @Column({ default: new Date() })
  lastActivity: Date;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  blockedAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  closedAt: Date;

  @Field()
  @FilterField()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @FilterField()
  @UpdateDateColumn()
  updatedAt: Date;
}

@InputType()
export class CloseSessionInput extends PickType(Session, ['id', 'user'], InputType) {}

@FilterWhereType(Session)
export class SessionWhereInput {}

@FilterOrderType(Session)
export class SessionOrderInput {}
