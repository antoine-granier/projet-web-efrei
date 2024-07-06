import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Message } from './message.model';
import { User } from './user.model';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field(() => [User])
  users: User[];

  @Field(() => [Message])
  messages?: Message[];
}
