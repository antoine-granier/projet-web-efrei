import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field(() => [String])
  users: string[];
}
