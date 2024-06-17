import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field(() => [User])
  users: User[];
}

@InputType()
export class InputChat {
  @Field(() => ID)
  id: string;

  @Field(() => [User])
  users: User[];
}