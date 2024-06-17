import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}

@InputType()
export class InputUser {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}