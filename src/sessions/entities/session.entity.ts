import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Schema as MongooseSchema } from 'mongoose';

import { Device, DeviceSchema } from './device.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Schema()
export class Session {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  user: MongooseSchema.Types.ObjectId;

  //   @Field()
  @Prop({ unique: true })
  token: string;

  @Field(() => Device, { nullable: true })
  @Prop({ type: DeviceSchema, default: {} })
  device: Device;

  @Field()
  @Prop()
  blocked: boolean;

  @Field()
  @Prop()
  closed: boolean;

  @Field()
  @Prop()
  createdAt: Date;

  @Field()
  @Prop()
  updatedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
