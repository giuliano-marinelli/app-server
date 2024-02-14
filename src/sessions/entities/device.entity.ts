import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType } from '@nestjs!/graphql-filter';

import { Column } from 'typeorm';

@ObjectType()
@InputType('DeviceInput')
export class Device {
  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  client: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  os: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  brand: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  model: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  type: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  bot: boolean;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  ip: string;
}

@FilterWhereType(Device)
export class DeviceWhereInput {}

@FilterOrderType(Device)
export class DeviceOrderInput {}
