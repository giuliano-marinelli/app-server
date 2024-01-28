import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@InputType('DeviceInput')
@Schema({ _id: false })
export class Device {
  @Field({ nullable: true })
  @Prop()
  client: string;

  @Field({ nullable: true })
  @Prop()
  os: string;

  @Field({ nullable: true })
  @Prop()
  brand: string;

  @Field({ nullable: true })
  @Prop()
  model: string;

  @Field({ nullable: true })
  @Prop()
  type: string;

  @Field({ nullable: true })
  @Prop()
  bot: boolean;

  @Field({ nullable: true })
  @Prop()
  ip: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
