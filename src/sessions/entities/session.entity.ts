import { Extensions, Field, InputType, ObjectType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { GraphQLUUID } from 'graphql-scalars';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Device, DeviceOrderInput, DeviceWhereInput } from './device.entity';
import { User, UserOrderInput, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('SessionInput', { isAbstract: true })
@Entity()
export class Session {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User, { nullable: true })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  @Field()
  @FilterField()
  @Column()
  token: string;

  @Field(() => Device, { nullable: true })
  @FilterField(() => DeviceWhereInput, () => DeviceOrderInput)
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

@FilterWhereType(Session)
export class SessionWhereInput {}

@FilterOrderType(Session)
export class SessionOrderInput {}

@Many(Session, { setName: 'set' })
export class Sessions {}
