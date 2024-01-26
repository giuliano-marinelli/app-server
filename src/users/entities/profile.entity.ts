import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ _id: false })
export class Profile {
  @Field({ nullable: true })
  @Prop()
  name: string;

  @Field({ nullable: true })
  @Prop()
  bio: string;

  @Field({ nullable: true })
  @Prop()
  location: string;

  @Field({ nullable: true })
  @Prop()
  url: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
